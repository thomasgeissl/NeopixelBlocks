import { Box, Typography } from "@mui/material";
import TabPanel from "./TabPanel";

const Programming = ({
  tabValue,
  index,
}: {
  tabValue: number;
  index: number;
}) => {
  return (
    <TabPanel value={tabValue} index={index}>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          Programming is the process of giving instructions to a computer to
          perform specific tasks. In Neopixel Blocks, you can program your LED
          projects using visual blocks that represent different commands and
          functions.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Programming Concepts
        </Typography>
        <Typography variant="body1" gutterBottom>
          Here are some basic programming concepts:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body2">
            <strong>Commands:</strong> Commands are instructions that tell the
            computer what to do. In Neopixel Blocks, commands can include
            actions like turning on an LED, changing its color, or creating
            animations.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Variables:</strong> Store data values that can change during
            program execution. They can be imagined as labeled boxes that hold
            information. At any time, you can look inside the box (variable) to
            see what value it holds or change the value by putting something new
            in the box.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Functions:</strong> Functions are reusable blocks of code
            that perform a specific task. You can think of them as mini-programs
            within your main program. Functions can take inputs, called
            parameters, and can return outputs.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Loops:</strong> Loops allow you to repeat a set of
            instructions multiple times. This is useful for creating animations
            or performing actions on multiple LEDs.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Conditionals:</strong> Conditionals let you make decisions
            in your program based on certain conditions. For example, you can
            use conditionals to change the color of an LED based on user input,
            sensor data, or e.g. only every second LED.
          </Typography>
        </Box>
      </Box>
    </TabPanel>
  );
};

export default Programming;
