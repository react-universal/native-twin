// Import the necessary modules from the Effect libraries
import { Args, Command } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Console, Effect } from 'effect';

// Define a text argument
const text = Args.text({ name: 'text' });

// Create a command that logs the provided text argument to the console
const command = Command.make('echo', { text }, ({ text }) => Console.log(text));

// Configure and initialize the CLI application
const cli = Command.run(command, {
  name: 'Echo CLI',
  version: 'v0.0.1',
});

// Prepare and run the CLI application, providing necessary context and runtime
cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
