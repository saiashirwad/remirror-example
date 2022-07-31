import "remirror/styles/all.css";
import "./Editor.css";

import { ThemeProvider } from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";

import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
} from "@chakra-ui/react";
import {
  EditorComponent,
  PlaceholderExtension,
  Remirror,
  useActive,
  useChainedCommands,
  useCommands,
  useCurrentSelection,
  useHelpers,
  useRemirror,
  useRemirrorContext,
} from "@remirror/react";
import { FC, useEffect, useMemo, useState } from "react";
import { prosemirrorNodeToHtml } from "remirror";
import {
  BoldExtension,
  DropCursorExtension,
  EmojiExtension,
  FontFamilyExtension,
  FontSizeExtension,
  HeadingExtension,
  ImageExtension,
  ItalicExtension,
  LinkExtension,
  MentionAtomExtension,
  TextColorExtension,
  UnderlineExtension,
} from "remirror/extensions";

const MENU_BAR_BG = "gray.100";
const MENU_BAR_ACTIVE_BG = "gray.100";

export const RichTextEditor: FC<IEditor> = (props) => {
  return (
    <ThemeProvider>
      <AllStyledComponent>
        <Editor {...props} />
      </AllStyledComponent>
    </ThemeProvider>
  );
};

interface IEditor {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: FC<IEditor> = ({ value, onChange }) => {
  const { manager, state, setState } = useRemirror({
    extensions,
    selection: "start",
    stringHandler: "html",
    content: value,
  });

  return (
    <Box border="1px" borderRadius={2} borderColor="gray.400" h="20em">
      <Remirror
        manager={manager}
        state={state}
        onChange={(param) => {
          onChange(prosemirrorNodeToHtml(param.state.doc));
          setState(param.state);
        }}
      >
        <MenuBar />
        <EditorComponent />
      </Remirror>
    </Box>
  );
};

const MenuBar = () => {
  const chain = useChainedCommands();
  const active = useActive();

  return (
    <Flex wrap={"wrap"} bg={MENU_BAR_BG} gap={1}>
      <Headings />
      <MButton
        onClick={() => {
          chain.toggleBold().focus().run();
        }}
        isActive={active.bold()}
      >
        B
      </MButton>
      <MButton
        onClick={() => {
          chain.toggleItalic().focus().run();
        }}
        isActive={active.italic()}
      >
        I
      </MButton>
      <MButton
        onClick={() => {
          chain.toggleUnderline().focus().run();
        }}
        isActive={active.underline()}
      >
        U
      </MButton>
      <FontSize />
      <FontFamily />
      <ImageUpload />
      <TextColor />
      <Personalization />
    </Flex>
  );
};

const MButton: FC<MButtonProps> = (props) => {
  return (
    <Button
      {...basicStyle}
      fontWeight={props.isActive ? "bold" : "normal"}
      fontFamily="monospace"
      {...props}
      _active={{
        bg: "gray.200",
        borderColor: "gray.600",
      }}
    />
  );
};

const Headings = () => {
  const commands = useCommands();
  const active = useActive();

  return (
    <>
      {[1, 2, 3, 4, 5].map((level) => (
        <MButton
          key={level}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.toggleHeading({ level })}
          isActive={active.heading({ level })}
        >
          H{level}
        </MButton>
      ))}
    </>
  );
};

type Field = {
  id: string;
  name: string;
};

const fields: Field[] = [
  { id: "1", name: "Sue" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Alice" },
  { id: "4", name: "John" },
  { id: "5", name: "Mary" },
];

const Personalization = () => {
  const commands = useCommands();
  const { from, to } = useCurrentSelection();

  const [search, setSearch] = useState("");

  const createMention = (field: Field) => {
    commands.createMentionAtom(
      { name: "field", range: { from, to, cursor: to } },
      { id: field.id, label: field.name }
    );
  };

  const results = useMemo(() => {
    return fields.filter((field) => {
      return field.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" fontWeight={"regular"} {...basicStyle}>
          Personalization
        </Button>
      </PopoverTrigger>
      <PopoverContent p={0} borderRadius={2}>
        <PopoverBody p={0}>
          <Input
            variant={"flushed"}
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && results.length) {
                createMention(results[0]);
              }
            }}
          />
          <Box w="100%" maxH="15em" overflowY={"auto"}>
            {results.map((field) => (
              <Box
                p={0.5}
                key={field.id}
                borderBottom="1px"
                color="gray.600"
                borderBottomColor={"gray.50"}
                px={2}
                _hover={{
                  backgroundColor: "gray.100",
                  color: "gray.800",
                }}
                onClick={() => createMention(field)}
              >
                {field.name}
              </Box>
            ))}
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const TextColor = () => {
  const commands = useCommands();
  const active = useActive();

  return (
    <Input
      border="none"
      value={"#000000"}
      onChange={(e: any) => {
        console.log(active.textColor());
        commands.setTextColor(e.target.value);
      }}
      type="color"
      w="4em"
      {...basicStyle}
    />
  );
};

const ImageUpload = () => {
  const commands = useCommands();

  const [url, setUrl] = useState("");

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Button variant="ghost" fontWeight={"regular"} {...basicStyle}>
            Image
          </Button>
        </PopoverTrigger>
        <PopoverArrow />
        <PopoverContent>
          <PopoverBody>
            <Flex direction="column" gap={2}>
              <Flex direction="column">
                <Input
                  placeholder="Insert Image URL"
                  size="sm"
                  value={url}
                  onChange={(e: any) => setUrl(e.target.value)}
                />
              </Flex>
              <Flex justify="flex-end">
                <Button
                  size="sm"
                  colorScheme="orange"
                  onClick={() => {
                    if (url) {
                      commands.insertImage({ src: url });
                    }
                  }}
                >
                  Add
                </Button>
              </Flex>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
};

const FontSize = () => {
  const commands = useCommands();
  const helpers = useHelpers();
  const { view } = useRemirrorContext({ autoUpdate: true });

  const sizes = [8, 10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 72] as const;

  const [size, setSize] = useState<number | undefined>(undefined);

  useEffect(() => {
    const selectionSize = helpers.getFontSizeForSelection(view.state.selection);
    const s = selectionSize[0][0];
    setSize(s === 0 ? undefined : s);
  }, [view.state.selection]);

  return (
    <Box>
      <Select
        w={"5em"}
        bg={MENU_BAR_BG}
        border="none"
        value={size}
        fontSize="0.9em"
        fontFamily={"mono"}
        onChange={(e: any) => {
          commands.setFontSize(e.target.value);
        }}
      >
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Select>
    </Box>
  );
};

const FontFamily = () => {
  const commands = useCommands();

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        fontWeight={"regular"}
        {...basicStyle}
      >
        Font Family
      </MenuButton>
      <MenuList py={0.5}>
        <MenuItem py={1} onClick={() => commands.setFontFamily("sans")}>
          Sans
        </MenuItem>
        <MenuItem py={1} onClick={() => commands.setFontFamily("serif")}>
          Sans Serif
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

type MButtonProps = ButtonProps & {
  isActive: boolean;
};

const basicStyle = {
  fontFamily: "monospace",
  p: 1,
  fontSize: "0.9em",
  bg: MENU_BAR_BG,
  borderRadius: 0,
  borderColor: "gray.200",
};

const extensions = () => [
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new EmojiExtension(),
  new FontSizeExtension(),
  new FontFamilyExtension({}),
  new ImageExtension({
    enableResizing: true,
  }),
  new DropCursorExtension(),
  new TextColorExtension(),
  new LinkExtension({
    autoLink: true,
  }),
  new PlaceholderExtension({
    placeholder: "Write something...",
  }),
  new HeadingExtension(),
  new MentionAtomExtension({
    extraAttributes: {
      type: "field-id",
    },
    matchers: [{ name: "field", char: "@", appendText: " ", matchOffset: 0 }],
  }),
];
