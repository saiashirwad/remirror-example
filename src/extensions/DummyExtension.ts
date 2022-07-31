import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  getTextSelection,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  PrimitiveSelection,
  toggleMark,
} from "remirror";

interface ExtensionProps {}

@extension<ExtensionProps>({ defaultOptions: {} })
export class DummyExtension extends MarkExtension<ExtensionProps> {
  createMarkSpec(
    extra: ApplySchemaAttributes,
    override: MarkSpecOverride
  ): MarkExtensionSpec {
    return {
      ...override,
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: "samp",
          getAttrs: extra.parse,
        },
        ...(override.parseDOM || []),
      ],
      toDOM: (node) => {
        return ["samp", extra.dom(node), 0];
      },
    };
  }

  get name() {
    return "dummy" as const;
  }

  @command()
  toggleSamp(selection?: PrimitiveSelection): CommandFunction {
    return toggleMark({ type: this.type, selection });
  }

  @command()
  setSamp(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      dispatch?.(tr.addMark(from, to, this.type.create()));

      return true;
    };
  }

  @command()
  removeSamp(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);

      if (!tr.doc.rangeHasMark(from, to, this.type)) {
        return false;
      }

      dispatch?.(tr.removeMark(from, to, this.type));

      return true;
    };
  }
}
