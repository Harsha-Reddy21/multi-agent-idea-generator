import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      increaseIndent: () => ReturnType
      decreaseIndent: () => ReturnType
    }
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading','listItem'],
        attributes: {
          indent: {
            default: 0,
            renderHTML: ({ indent }) => {
              if (!indent) return {}
              return {
                style: `margin-left: ${indent * 24}px`,
              }
            },
            parseHTML: element => {
              const margin = element.style.marginLeft
              return margin ? parseInt(margin) / 24 : 0
            },
          },
        },
      },
    ]
  },

 addCommands() {
  return {
    increaseIndent:
      () =>
      ({ state, dispatch }) => {
        const { from, to } = state.selection
        let tr = state.tr

        state.doc.nodesBetween(from, to, (node, pos, parent) => {
          // ✅ Case 1: list → indent ONLY listItem
          if (node.type.name === 'listItem') {
            const indent = (node.attrs.indent || 0) + 1

            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              indent,
            })
            return
          }

          if (
            node.type.name === 'paragraph' &&
            parent?.type.name === 'listItem'
          ) {
            return
          }

          // ✅ Normal paragraph / heading
          if (
            node.type.name === 'paragraph' ||
            node.type.name === 'heading'
          ) {
            const indent = (node.attrs.indent || 0) + 1

            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              indent,
            })
          }
        })

        if (dispatch) dispatch(tr)
        return true
      },

    decreaseIndent:
      () =>
      ({ state, dispatch }) => {
        const { from, to } = state.selection
        let tr = state.tr

        state.doc.nodesBetween(from, to, (node, pos, parent) => {
          if (node.type.name === 'listItem') {
            const indent = Math.max((node.attrs.indent || 0) - 1, 0)

            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              indent,
            })
            return
          }

          if (
            node.type.name === 'paragraph' &&
            parent?.type.name === 'listItem'
          ) {
            return
          }

          if (
            node.type.name === 'paragraph' ||
            node.type.name === 'heading'
          ) {
            const indent = Math.max((node.attrs.indent || 0) - 1, 0)

            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              indent,
            })
          }
        })

        if (dispatch) dispatch(tr)
        return true
      },
  }
}


})
