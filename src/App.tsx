import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { RichTextEditor } from "./Editor";

function App() {
  const [value, setValue] = useState("<p>Hi</p>");
  return (
    <Box m={2}>
      <RichTextEditor value={value} onChange={setValue} />
    </Box>
  );
}

export default App;
