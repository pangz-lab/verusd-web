import { TsSkeleton } from "../../src/lib/TsSkeleton";
describe('TsSkeleton', () => {
  it('should log the expected message', () => {
    // Create an instance of TsSkeleton
    const yourClass = new TsSkeleton();

    // Mock console.log
    const consoleLogMock = jest.spyOn(console, 'log');

    // Call the hello method
    yourClass.hello();

    // Assert that console.log was called with the expected message
    expect(consoleLogMock).toHaveBeenCalledWith('Hello from verusd-web - 💀💀💀!!!');

    // Restore the original console.log
    consoleLogMock.mockRestore();
  });
});