export {}

// Problem: terminal is loaded before node-system's __write
// Idea: Promise with write function
// BUT, you can't assume loading order ()
