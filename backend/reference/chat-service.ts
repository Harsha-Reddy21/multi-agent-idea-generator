import { prisma } from "@/db/db";
import { cacheService } from "@/lib/cache/cache-service";
import {
  createAssistant,
  getAssistantById,
} from "@/db/queries/assistant-queries";
import { getUserByEmail, createUser } from "@/db/queries/users-queries";
import logger from "@/lib/logger";
import { ChatCreate } from "@/lib/schema/chat";
import { CortexService } from "./cortex.service";

// Check if the session exists in the response
interface CortexHistorySession {
  id: string;
  createdAt?: string | number;
  lastUpdated?: string | number;
  userId?: string;
  lastMessagePartial?: {
    id: string;
    query: string;
    response: string;
    created: string | number;
    tokenCount: number;
    steps: any[];
  };
  [key: string]: any; // Additional properties that may exist in the session
}

interface CortexHistoryResponse {
  sessions: CortexHistorySession[];
}

// Interface for chat history session
interface ChatHistorySession {
  chatId: string;
  assistantId: string;
  userId: string;
  sessionTitle: string;
  session: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * ChatService - Handles CRUD operations for chat history
 */
export class ChatService {
  // The number of days to keep chat sessions before hard deletion
  private readonly SESSION_RETENTION_DAYS = 30;
  // The number of sessions to fetch per page
  private readonly SESSIONS_PER_PAGE = 100;
  // Cache TTL in seconds (1 day)
  private readonly CACHE_TTL = 86400;
  // Maximum length for session titles
  private readonly SESSION_TITLE_MAX_LENGTH = 41;

  /**
   * Delete assistant and all related data using transaction
   * Ensures data consistency by deleting chats, user associations, and assistant in one atomic operation
   *
   * @param assistantId - The assistant/workspace ID
   * @returns Object with counts of deleted records
   */
  async deleteAssistantWithRelations(
    assistantId: string,
  ): Promise<{ chatCount: number; userAssociationCount: number }> {
    logger.info("Preparing to delete assistant with all relations", {
      assistantId,
    });

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Delete chats
        const chatDeleteResult = await tx.chat.deleteMany({
          where: { assistantId },
        });

        // Delete user associations
        const userAssociationDeleteResult = await tx.userAssistant.deleteMany({
          where: { assistantId },
        });

        // Delete assistant
        await tx.assistant.delete({
          where: { assistantId },
        });

        return {
          chatCount: chatDeleteResult.count,
          userAssociationCount: userAssociationDeleteResult.count,
        };
      });

      // Clear cache after successful transaction
      await cacheService.clearByPrefix(`chat:*:${assistantId}*`);

      logger.info("Assistant and all relations deleted successfully", {
        assistantId,
        ...result,
      });

      return result;
    } catch (error) {
      logger.error("Failed to delete assistant with relations", {
        assistantId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Creates a new chat entry in the database and updates Redis cache
   *
   * @param chatData - The chat data to be stored
   * @returns The created chat object
   */
  async create(chatData: ChatCreate) {
    logger.info("Creating chat session", {
      chatId: chatData.chatId,
      assistantId: chatData.assistantId,
      userId: chatData.userId,
    });

    // Validate chat session first
    await this.validateChatSession(chatData);

    try {
      // Verify the assistant exists in the database
      const assistant = await getAssistantById(chatData.assistantId);

      if (!assistant) {
        await createAssistant({
          assistantId: chatData.assistantId,
          icon: "",
          icon_color: "",
          createdBy: chatData.userId,
          updatedBy: chatData.userId,
          sensitivityClassification: null,
          hasSyncs: null,
        });
      }

      // Verify the user exists in the database
      const user = await getUserByEmail(chatData.userId);

      if (!user) {
        // If user doesn't exist, create the user first
        logger.info("User not found, creating new user", {
          userId: chatData.userId,
        });
        await createUser(chatData.userId);
      }

      // Truncate sessionTitle to 41 characters if necessary
      const truncatedSessionTitle =
        chatData.sessionTitle.length > this.SESSION_TITLE_MAX_LENGTH
          ? chatData.sessionTitle.substring(0, this.SESSION_TITLE_MAX_LENGTH)
          : chatData.sessionTitle;

      // Create a new chat record in the database
      const createdChat = await prisma.chat.create({
        data: {
          chatId: chatData.chatId,
          assistantId: chatData.assistantId,
          userId: chatData.userId,
          sessionTitle: truncatedSessionTitle,
          session:
            chatData.session === null
              ? { dbgenerated: "null" }
              : chatData.session,
        },
      });

      // Update Redis cache with the new session ID
      const cacheKey = `chat:${chatData.userId}:${chatData.assistantId}`;

      // Get existing sessions from cache or create a new array
      const existingSessions =
        (await cacheService.get<string[]>(cacheKey)) || [];

      // Add the new session ID to the array, for time being using chatId as sessionId
      existingSessions.push(chatData.chatId);

      // Update the cache with the new array and set TTL to 1 day (86400 seconds)
      await cacheService.set(cacheKey, existingSessions, 86400);

      logger.info(`Chat created and cache updated`, {
        chatId: chatData.chatId,
        userId: chatData.userId,
        assistantId: chatData.assistantId,
        totalSessions: existingSessions.length,
        originalTitleLength: chatData.sessionTitle.length,
        truncatedTitleLength: truncatedSessionTitle.length,
      });

      return createdChat;
    } catch (error) {
      logger.error("Failed to create chat session", {
        error: (error as Error).message,
        chatId: chatData.chatId,
        userId: chatData.userId,
      });
      throw error;
    }
  }

  /**
   * Updates an existing chat's title in the database
   *
   * @param chat_id - The ID of the chat to update
   * @param user_id - The ID of the user making the update
   * @param sessionTitle - The new title for the chat session
   * @param chatTitleUpdation - If true, only updates sessionTitle; if false, updates both sessionTitle and updatedAt
   * @returns The updated chat object
   */
  async updateChatTitle(
    chat_id: string,
    user_id: string,
    sessionTitle: string,
    chatTitleUpdation: boolean = true, // Optional, defaults to true
    session?: any,
  ): Promise<any> {
    logger.info("Updating chat session title", {
      chatId: chat_id,
      userId: user_id,
      sessionTitle,
    });

    try {
      // Verify that the chat exists and belongs to the user
      const chat = await prisma.chat.findFirst({
        where: {
          chatId: chat_id,
          userId: user_id,
          deletedAt: null, // Only update if not deleted
        },
      });

      if (!chat) {
        logger.warn("Chat not found or does not belong to user", {
          chatId: chat_id,
          userId: user_id,
        });
        throw new Error("Chat not found or access denied");
      }

      // Truncate sessionTitle to 41 characters if necessary
      const truncatedSessionTitle =
        sessionTitle.length > this.SESSION_TITLE_MAX_LENGTH
          ? sessionTitle.substring(0, this.SESSION_TITLE_MAX_LENGTH)
          : sessionTitle;

      // Update the chat title in the database
      // If chatTitleUpdation is true, only update sessionTitle, not updatedAt
      const updateData: any = {
        sessionTitle: truncatedSessionTitle,
      };

      if (session) {
        updateData.session = session;
      }

      if (!chatTitleUpdation) {
        updateData.updatedAt = new Date();
      } else {
        updateData.updatedAt = chat?.updatedAt;
      }
      const updatedChat = await prisma.chat.update({
        where: { chatId: chat_id },
        data: updateData,
      });

      logger.info("Chat title updated successfully", {
        chatId: chat_id,
        userId: user_id,
        originalTitleLength: sessionTitle.length,
        truncatedTitleLength: truncatedSessionTitle.length,
      });

      // Clear the specific chat cache
      await this.clearChatCache(user_id, chat.assistantId, chat_id);

      return updatedChat;
    } catch (error) {
      logger.error("Failed to update chat title", {
        error: (error as Error).message,
        chatId: chat_id,
        userId: user_id,
      });
      throw error;
    }
  }

  /**
   * Gets all valid chat sessions for a user and assistant within the last 30 days
   * Performs hard deletion of sessions older than 30 days
   *
   * @param userId - The user ID
   * @param assistantId - The assistant ID
   * @param pagination - Optional pagination parameters
   * @returns List of chat history sessions with pagination metadata
   */
  async getSessions(
    auth: string,
    userId: string,
    assistantId: string,
    pagination?: { start?: number; end?: number },
  ): Promise<{
    data: ChatHistorySession[];
    total: number;
    start: number;
    end: number;
    hasMore: boolean;
  }> {
    if (!userId || !assistantId) {
      logger.warn("Invalid parameters for getSessions", {
        userId,
        assistantId,
      });
      throw new Error("User ID and Assistant ID are required");
    }

    // Set default pagination values
    // If no pagination is specified, return all sessions (start from 0, no end limit)
    const start = pagination?.start ?? 0;
    const end = pagination?.end ?? undefined;

    // Check cache first
    const cacheKey = `chat:${userId}:${assistantId}`;
    let sessionIds = await cacheService.get<string[]>(cacheKey);

    // Filter out null or undefined values if they exist in the array
    if (sessionIds && Array.isArray(sessionIds)) {
      sessionIds = sessionIds.filter((id) => id !== null && id !== undefined);
    }

    // If not in cache, fetch from Cortex and update cache
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      logger.info("Session IDs not found in cache, fetching from Cortex", {
        cacheKey,
        cachedSessionIds: sessionIds,
      });
      sessionIds = await this.getCortexSessions(auth, userId, assistantId);
    }

    // Get all sessions from database that match the session IDs and aren't soft-deleted
    const allSessions = await prisma.chat.findMany({
      where: {
        userId,
        assistantId,
        chatId: {
          in: sessionIds,
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Total count of all valid sessions
    const total = allSessions.length;

    // Apply pagination to the sessions
    let paginatedSessions: any[] = [];
    let hasMore = false;

    if (start < 0) {
      // Negative index (Python-style slicing from the end)
      // start: -3, end: -1 means "from 3rd last to 1st last (exclusive)"
      const startIndex = Math.max(0, total + start); // Convert negative to positive index
      const endIndex = end !== undefined ? Math.max(0, total + end) : total;

      paginatedSessions = allSessions.slice(startIndex, endIndex);
      hasMore = endIndex < total;
    } else {
      // Positive index (from the beginning)
      const startIndex = Math.min(start, total);
      const endIndex = end ? Math.min(end, total) : total;

      paginatedSessions = allSessions.slice(startIndex, endIndex);
      hasMore = endIndex < total;
    }

    // Calculate actual start and end indices used
    const actualStart =
      start < 0 ? Math.max(0, total + start) : Math.min(start, total);
    const actualEnd =
      start < 0
        ? end !== undefined
          ? Math.max(0, total + end)
          : total
        : Math.min(end ?? actualStart + paginatedSessions.length, total);

    logger.info("Successfully retrieved chat sessions", {
      sessionCount: paginatedSessions.length,
    });

    return {
      data: paginatedSessions as ChatHistorySession[],
      total,
      start: actualStart,
      end: actualEnd,
      hasMore,
    };
  }

  /**
   * Fetches session IDs from Cortex History service
   * Returns only sessions within the last 30 days
   * Performs cleanup of old sessions
   *
   * @param userId - The user ID
   * @param assistantId - The assistant ID
   * @returns Array of session IDs within the retention period
   * @private
   */
  async getCortexSessions(
    auth: string,
    userId: string,
    assistantId: string,
  ): Promise<string[]> {
    logger.info("Fetching sessions from Cortex History service");

    try {
      // Set cutoff date (30 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.SESSION_RETENTION_DAYS);

      // Set up for pagination
      let allSessions: CortexHistorySession[] = [];
      let page = 0;
      let reachedOldSessions = false;

      // Paginate through results until we reach sessions older than 30 days
      while (!reachedOldSessions) {
        // Use start and end parameters for negative indexing pagination
        // This matches the API expectations for pagination
        const start = page * this.SESSIONS_PER_PAGE * 1;
        const end = (page + 1) * this.SESSIONS_PER_PAGE * 1;

        // Create the query parameters string
        const queryParams = new URLSearchParams({
          start: start.toString(),
          end: end.toString(),
        });

        const headers = new Headers();
        headers.set("Authorization", auth);

        // Get history sessions from Cortex using start/end pagination
        const historySessions = await CortexService.getHistorySessions(
          assistantId,
          queryParams.toString(),
          headers,
        );

        if (
          !historySessions ||
          !historySessions.sessions ||
          !Array.isArray(historySessions.sessions)
        ) {
          logger.warn("Invalid response from Cortex History service");
          break;
        }

        const sessions = historySessions.sessions;

        // If no sessions returned, we've reached the end
        if (!sessions || sessions.length === 0) {
          break;
        }

        // Check if we've reached sessions older than the cutoff date
        const oldestSessionInBatch = sessions.reduce(
          (
            oldest: CortexHistorySession | null,
            current: CortexHistorySession,
          ) => {
            if (!current.createdAt && !current.lastUpdated) return oldest;

            // Use createdAt if available, otherwise fallback to lastUpdated
            const timestamp = current.createdAt || current.lastUpdated;
            if (!timestamp) return oldest;

            const currentDate = new Date(timestamp as string | number);
            if (isNaN(currentDate.getTime())) return oldest;

            if (!oldest) return current;

            const oldestTimestamp = oldest.createdAt || oldest.lastUpdated;
            if (!oldestTimestamp) return current;

            const oldestDate = new Date(oldestTimestamp as string | number);
            if (currentDate < oldestDate) {
              return current;
            }

            return oldest;
          },
          null as CortexHistorySession | null,
        );

        if (oldestSessionInBatch) {
          // Use createdAt if available, otherwise fallback to lastUpdated
          const timestamp =
            oldestSessionInBatch.createdAt || oldestSessionInBatch.lastUpdated;
          if (timestamp) {
            const oldestDate = new Date(timestamp as string | number);
            if (oldestDate < cutoffDate) {
              reachedOldSessions = true;

              // Filter out sessions older than cutoff date from this batch
              const validSessionsInBatch = sessions.filter(
                (session: CortexHistorySession) => {
                  const sessionTimestamp =
                    session.createdAt || session.lastUpdated;
                  if (!sessionTimestamp) return false;
                  const sessionDate = new Date(
                    sessionTimestamp as string | number,
                  );
                  return (
                    !isNaN(sessionDate.getTime()) && sessionDate >= cutoffDate
                  );
                },
              );

              // Add only valid sessions from this batch
              allSessions = [...allSessions, ...validSessionsInBatch];
              break;
            }
          }
        }

        // Add sessions to our collection
        allSessions = [...allSessions, ...sessions];

        // Move to next page (for negative indexing, we increase the magnitude of the negative index)
        page++;

        // Safeguard: if we've already got a lot of sessions or paginated too far, stop
        if (allSessions.length > 1000 || page > 10) {
          logger.info("Reached pagination limit when fetching sessions", {
            totalSessions: allSessions.length,
            pages: page,
          });
          break;
        }
      }

      // Filter sessions to only include those associated with the current user
      // The date filtering should already be done above
      const validSessions = allSessions
        .filter((session: CortexHistorySession) => {
          // If session has user info, verify it matches
          if (session.userId && session.userId !== userId) {
            return false;
          }

          // Make sure session has an ID
          if (!session.id) {
            return false;
          }

          return true;
        })
        .map((session: CortexHistorySession) => session.id);

      // Get existing sessions from database to ensure we only include sessions
      // that actually exist in our database
      const dbSessions = await prisma.chat.findMany({
        where: {
          userId,
          assistantId,
          chatId: {
            in:
              validSessions.length > 0 ? validSessions : ["dummy-id-if-empty"],
          },
        },
        select: {
          chatId: true,
        },
      });

      const confirmedSessionIds = dbSessions.map((session) => session.chatId);

      // Wipe old sessions that are no longer valid
      await this.wipeOldCortexSessions(
        userId,
        assistantId,
        confirmedSessionIds,
      );

      // Cache the valid session IDs
      const cacheKey = `chat:${userId}:${assistantId}`;
      await cacheService.set(cacheKey, confirmedSessionIds, this.CACHE_TTL);

      logger.info("Successfully fetched and cached Cortex sessions", {
        sessionCount: confirmedSessionIds.length,
      });

      return confirmedSessionIds;
    } catch (error) {
      logger.error("Error fetching sessions from Cortex History service", {
        error: (error as Error).message,
        userId,
        assistantId,
      });
      return [];
    }
  }

  /**
   * Identifies and deletes sessions that are no longer valid (older than 30 days)
   *
   * @param userId - The user ID
   * @param assistantId - The assistant ID
   * @param currentSessionIds - Array of current valid session IDs
   * @private
   */
  private async wipeOldCortexSessions(
    userId: string,
    assistantId: string,
    currentSessionIds: string[],
  ): Promise<void> {
    logger.info("Identifying old sessions for deletion");

    try {
      // Set cutoff date (30 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.SESSION_RETENTION_DAYS);

      // Get all sessions for this user and assistant from the database
      const dbSessions = await prisma.chat.findMany({
        where: {
          userId,
          assistantId,
        },
        select: {
          chatId: true,
          createdAt: true,
        },
      });

      // Identify sessions that are either:
      // 1. Not in the current session IDs list, or
      // 2. Older than the cutoff date
      const sessionsToDelete = dbSessions
        .filter((session) => {
          const isNotInCurrentList = !currentSessionIds.includes(
            session.chatId,
          );
          const isOlderThanCutoff = new Date(session.createdAt) < cutoffDate;
          return isNotInCurrentList || isOlderThanCutoff;
        })
        .map((session) => session.chatId);

      if (sessionsToDelete.length > 0) {
        logger.info("Found sessions to delete", {
          deleteCount: sessionsToDelete.length,
        });

        // Perform hard deletion of old sessions
        await this.hardDeleteSessions(sessionsToDelete, userId, assistantId);

        logger.info("Completed deletion of old sessions", {
          assistantId,
          userId,
          deletedCount: sessionsToDelete.length,
        });
      } else {
        logger.info("No old sessions to delete", {
          assistantId,
          userId,
        });
      }
    } catch (error) {
      logger.error("Error wiping old Cortex sessions", {
        error: (error as Error).message,
        userId,
        assistantId,
      });
      // Don't throw here to prevent failure of the main getSessions flow
    }
  }

  /**
   * Permanently deletes sessions from the database and cache
   *
   * @param sessionIdsToDelete - Array of session IDs to delete
   * @param userId - The user ID
   * @param assistantId - The assistant ID
   * @private
   */
  private async hardDeleteSessions(
    sessionIdsToDelete: string[],
    userId: string,
    assistantId: string,
  ): Promise<void> {
    if (!sessionIdsToDelete.length) {
      logger.info("No sessions to delete");
      return;
    }

    logger.info("Performing hard deletion of sessions", {
      sessionCount: sessionIdsToDelete.length,
    });

    try {
      // Delete sessions from the database
      const deleteResult = await prisma.chat.deleteMany({
        where: {
          chatId: {
            in: sessionIdsToDelete,
          },
        },
      });

      // Delete session-specific cache entries
      let cacheDeleteSuccesses = 0;
      let cacheDeleteFailures = 0;

      for (const sessionId of sessionIdsToDelete) {
        try {
          const sessionCacheKey = `chat:${userId}:${assistantId}:${sessionId}`;
          await cacheService.delete(sessionCacheKey);
          cacheDeleteSuccesses++;
        } catch (error) {
          logger.error("Error deleting session cache", {
            error: (error as Error).message,
          });
          cacheDeleteFailures++;
        }
      }

      // Update the list of sessions in cache
      const cacheKey = `chat:${userId}:${assistantId}`;
      const cachedSessions = await cacheService.get<string[]>(cacheKey);

      if (cachedSessions && Array.isArray(cachedSessions)) {
        const updatedSessions = cachedSessions.filter(
          (id) => !sessionIdsToDelete.includes(id),
        );

        logger.info("Updating session list in cache", {
          newCount: updatedSessions.length,
        });

        await cacheService.set(cacheKey, updatedSessions, this.CACHE_TTL);
      }

      logger.info("Successfully deleted sessions", {
        deletedCount: deleteResult.count,
        userId,
        assistantId,
      });
    } catch (error) {
      logger.error("Error performing hard deletion of sessions", {
        error: (error as Error).message,
        userId,
        assistantId,
        sessionIds: sessionIdsToDelete,
      });
      throw error;
    }
  }

  /**
   * Validate chat session by connecting to Cortex History service via gRPC
   * to verify that this Chat Session exists in the Cortex system
   *
   * @param chatData - The chat data to validate
   * @private
   */
  private async validateChatSession(chatData: ChatCreate): Promise<void> {
    // Check for required fields
    if (!chatData.chatId) {
      logger.warn("Validation failed: Chat ID is required");
      throw new Error("Chat ID is required");
    }

    if (!chatData.assistantId) {
      logger.warn("Validation failed: Assistant ID is required");
      throw new Error("Assistant ID is required");
    }

    if (!chatData.userId) {
      logger.warn("Validation failed: User ID is required");
      throw new Error("User ID is required");
    }

    if (!chatData.sessionTitle) {
      logger.warn("Validation failed: Session title is required");
      throw new Error("Session title is required");
    }

    if (!chatData.session || typeof chatData.session !== "object") {
      logger.warn("Validation failed: Session data must be a valid object");
      throw new Error("Session data must be a valid object");
    }

    // Make actual API call to Cortex History service
    // try {
    // logger.info("Calling Cortex History service to validate chat session");

    // const historySessions = await cortexClient.getHistorySessions(
    //   chatData.assistantId,
    // );

    // if (
    //   !historySessions ||
    //   !historySessions.sessions ||
    //   !Array.isArray(historySessions.sessions)
    // ) {
    //   logger.warn("Invalid response from Cortex History service");
    //   throw new Error("Invalid response from Cortex History service");
    // }

    // No Need to check if the session exists while creating a new chat
    // const sessionExists: boolean = (
    //   historySessions as CortexHistoryResponse
    // ).sessions.some(
    //   (session: CortexHistorySession) => session.id === chatData.chatId,
    // );

    // if (!sessionExists) {
    //   logger.warn("Chat session not found in Cortex History service", {
    //     chatId: chatData.chatId,
    //   });
    //   throw new Error(
    //     `Chat session ${chatData.chatId} not found in Cortex History service`,
    //   );
    // }

    // logger.info("Chat session validated in Cortex History service");
    // } catch (error) {
    //   logger.error("Error connecting to Cortex History service", {
    //     error: (error as Error).message,
    //   });
    //   throw new Error(
    //     `Failed to validate chat session: ${(error as Error).message}`,
    //   );
    // }
  }

  /**
   * Soft deletes a chat session by setting the deletedAt field
   * This keeps the record in the database but excludes it from queries
   *
   * @param model - The assistant ID
   * @param chat_id - The chat ID to soft delete
   * @param user_id - The user ID
   * @returns Promise<void>
   */
  async softDeleteChat(
    model: string,
    chat_id: string,
    user_id: string,
  ): Promise<void> {
    logger.info("Soft deleting chat", {
      chatId: chat_id,
    });

    try {
      // Update the chat item in the database to set deletedAt
      const updatedChat = await prisma.chat.update({
        where: { chatId: chat_id },
        data: { deletedAt: new Date() },
      });

      if (!updatedChat) {
        logger.warn("Chat not found for soft deletion", {
          chatId: chat_id,
          userId: user_id,
        });
        throw new Error(`Chat with ID ${chat_id} not found`);
      }

      // Also need to update the list of chat IDs in the cache
      await this.updateChatListCache(user_id, model, chat_id);

      // Clear the specific chat cache
      await this.clearChatCache(user_id, model, chat_id);

      logger.info(`Chat with ID ${chat_id} marked as deleted.`);
      logger.info("Chat soft deleted successfully", {
        model,
        chatId: chat_id,
        userId: user_id,
      });
    } catch (error) {
      logger.error("Failed to soft delete chat:", error);
      throw error;
    }
  }

  /**
   * Soft deletes all chat sessions for a specific user and model by setting the deletedAt field
   * This keeps the records in the database but excludes them from queries
   *
   * @param model - The assistant ID
   * @param user_id - The user ID
   * @returns Promise<{ deletedCount: number }>
   */
  async softDeleteAllChatsForModel(
    model: string,
    user_id: string,
  ): Promise<{ deletedCount: number }> {
    logger.info("Soft deleting all chats for model", {
      model,
      userId: user_id,
    });

    try {
      // First, get all chat IDs that will be deleted for cache cleanup
      const chatsToDelete = await prisma.chat.findMany({
        where: {
          assistantId: model,
          userId: user_id,
          deletedAt: null, // Only get non-deleted chats
        },
        select: {
          chatId: true,
        },
      });

      if (chatsToDelete.length === 0) {
        logger.info("No chats found to delete for model", {
          model,
          userId: user_id,
        });
        return { deletedCount: 0 };
      }

      const chatIds = chatsToDelete.map((chat) => chat.chatId);

      // Update all chat items in the database to set deletedAt
      const updateResult = await prisma.chat.updateMany({
        where: {
          assistantId: model,
          userId: user_id,
          deletedAt: null, // Only update non-deleted chats
        },
        data: { deletedAt: new Date() },
      });

      if (updateResult.count === 0) {
        logger.warn("No chats were soft deleted", {
          model,
          userId: user_id,
        });
        return { deletedCount: 0 };
      }

      // Clear the entire chat list cache for this user and model
      const cacheKey = `chat:${user_id}:${model}`;
      await cacheService.delete(cacheKey);

      // Clear individual chat caches
      const cacheCleanupPromises = chatIds.map((chatId) =>
        this.clearChatCache(user_id, model, chatId).catch((error) => {
          logger.error("Failed to clear individual chat cache", {
            chatId,
            error: (error as Error).message,
          });
          // Don't throw, just log the error
        }),
      );

      await Promise.all(cacheCleanupPromises);

      logger.info("All chats for model soft deleted successfully", {
        model,
        userId: user_id,
        deletedCount: updateResult.count,
      });

      return { deletedCount: updateResult.count };
    } catch (error) {
      logger.error("Failed to soft delete all chats for model:", error);
      throw error;
    }
  }

  /**
   * Updates the list of chat IDs in Redis cache when a chat is soft deleted
   *
   * @param user_id - The user ID
   * @param assistant_id - The assistant ID
   * @param chat_id - The chat ID that was soft deleted
   * @private
   */
  private async updateChatListCache(
    user_id: string,
    assistant_id: string,
    chat_id: string,
  ): Promise<void> {
    const cacheKey = `chat:${user_id}:${assistant_id}`;

    try {
      // Get the existing list of chat IDs from cache
      const chatIds = await cacheService.get<string[]>(cacheKey);

      if (chatIds && Array.isArray(chatIds)) {
        // Remove the soft-deleted chat ID from the list
        const updatedChatIds = chatIds.filter((id) => id !== chat_id);

        // Update the cache with the new list
        await cacheService.set(cacheKey, updatedChatIds, this.CACHE_TTL);

        logger.info("Updated chat list cache after soft deletion", {
          newCount: updatedChatIds.length,
        });
      }
    } catch (error) {
      logger.error("Failed to update chat list cache", {
        error: (error as Error).message,
      });
      // Don't throw error here to allow the rest of the deletion process to continue
    }
  }

  /**
   * Clears the cache for a specific chat
   *
   * @param user_id - The user ID
   * @param assistant_id - The assistant ID
   * @param chat_id - The chat ID
   * @private
   */
  private async clearChatCache(
    user_id: string,
    assistant_id: string,
    chat_id: string,
  ): Promise<void> {
    const cacheKey = `chat:${user_id}:${assistant_id}:${chat_id}`;

    try {
      await cacheService.delete(cacheKey);
      logger.info(`Cache cleared for chat with key ${cacheKey}`);
    } catch (error) {
      logger.error(
        `Failed to clear cache for chat with key ${cacheKey}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gets a single chat session by ID
   * First checks cache, then database
   *
   * @param userId - The user ID
   * @param assistantId - The assistant ID
   * @param chatId - The chat ID to retrieve
   * @returns The chat session if found and authorized, { unauthorized: true } if unauthorized, null if not found
   */
  async getChat(
    userId: string,
    assistantId: string,
    chatId: string,
  ): Promise<ChatHistorySession | { unauthorized: true } | null> {
    if (!userId || !assistantId || !chatId) {
      logger.warn("Invalid parameters for getChat", {
        userId,
        assistantId,
        chatId,
      });
      throw new Error("User ID, Assistant ID, and Chat ID are required");
    }

    logger.info("Retrieving chat session", {
      userId,
      assistantId,
      chatId,
    });

    try {
      // Check cache first
      const cacheKey = `chat:${userId}:${assistantId}:${chatId}`;
      const cachedChat = await cacheService.get<ChatHistorySession>(cacheKey);

      if (cachedChat) {
        logger.info("Chat session found in cache");
        return cachedChat;
      }

      // Not found in cache, check database
      // Query without userId to find the chat first
      const chatSession = await prisma.chat.findUnique({
        where: {
          assistantId,
          chatId,
          deletedAt: null, // Don't return soft-deleted chats
        },
      });

      if (!chatSession) {
        logger.info("Chat session not found in database");
        return null;
      }

      // Check authorization
      if (chatSession.userId !== userId) {
        logger.warn("Unauthorized access attempt", {
          requestingUserId: userId,
          chatUserId: chatSession.userId,
          chatId,
          assistantId,
        });
        return { unauthorized: true };
      }

      // Convert to ChatHistorySession
      const chatHistorySession: ChatHistorySession = {
        chatId: chatSession.chatId,
        assistantId: chatSession.assistantId,
        userId: chatSession.userId,
        sessionTitle: chatSession.sessionTitle,
        session: chatSession.session,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
        deletedAt: chatSession.deletedAt,
      };

      // Cache the result
      await cacheService.set(cacheKey, chatHistorySession, this.CACHE_TTL);

      logger.info("Chat session retrieved and cached");
      return chatHistorySession;
    } catch (error) {
      logger.error("Error retrieving chat session", {
        error: (error as Error).message,
        userId,
        assistantId,
        chatId,
      });
      throw error;
    }
  }
}