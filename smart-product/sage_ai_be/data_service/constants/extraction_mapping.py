"""
Extraction Mapping Constants
=============================
Maps question prefixes to database form schema names for dynamic question-based extraction
"""

from data_service.constants.constants import FormType

# QUESTION PREFIX TO FORM SCHEMA NAME MAPPING
# Maps question ID prefixes (AI, W, L, R, S, D) to database form schema names
# Used for grouping dynamic question answers by form
PREFIX_TO_FORM = {
    "AI": FormType.AI_REGISTRY,
    "W": FormType.WWTP,
    "L": FormType.DLO,
    "R": FormType.GCO_RISK_REGISTRY,
    "S": FormType.SECURITY_ARCH,
    "D": FormType.IDEA_SUB,
}

# FORMS EXCLUDED FROM DOCUMENT EXTRACTION
# Questions from these forms will not be sent to Cortex for document extraction
EXCLUDED_EXTRACTION_FORMS = [FormType.GCO_RISK_REGISTRY]

# SPECIFIC QUESTION IDs INCLUDED FOR DOCUMENT EXTRACTION
# Only these question IDs will be processed for document extraction
# If empty, all questions (except excluded forms) will be processed
# NOTE: Future enhancement - consider loading this from a JSON config file for easier maintenance
INCLUDED_QUESTION_IDS = [
    # D series - Idea Submission Form
    "D-Q01",
    "D-Q02",
    "D-Q03",
    "D-Q04",
    # AI series - AI Registry Form
    "AI-Q6",
    "AI-Q7",
    "AI-Q12",
    "AI-Q20",
    "AI-Q23",
    # L series - DLO Form
    "L-Q5",
    # S series - Security Architecture Form
    "S-Q3",
    "S-Q22",
    "S-Q25",
    # W series - WWTP Form
    "W-Q3",
]
