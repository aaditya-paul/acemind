import React from "react";

// Data for 8086 Register Organization
const registerData = {
  title: "8086 Register Organization",
  sections: [
    {
      heading: "Introduction to 8086 Registers",
      type: "text",
      content: [
        "The 8086 microprocessor features a sophisticated set of registers that are crucial for its operation. These registers are *high-speed storage locations* within the CPU itself, used to temporarily hold data, memory addresses, and control information during program execution.",
        "They provide **fast access** to data, significantly improving the overall processing speed and efficiency of the microprocessor.",
        "The 8086 has a total of **fourteen 16-bit registers**. These can be broadly categorized into General Purpose Registers, Pointer and Index Registers, Segment Registers, the Instruction Pointer, and the Flags Register.",
      ],
    },
    {
      heading: "General Purpose Registers",
      type: "text",
      content: [
        "These are 16-bit registers, and each can be accessed as two separate 8-bit registers (High and Low byte).",
        "**AX (Accumulator Register)**: This is the *primary accumulator*. It's widely used for arithmetic, logical, and data transfer operations. For example, in multiplication and division, one operand is implicitly assumed to be in AX. It can be accessed as AH (high 8-bit) and AL (low 8-bit).",
        "**BX (Base Register)**: Often used to hold the *base address* of data in memory, especially when accessing data structures or arrays. It can be accessed as BH (high 8-bit) and BL (low 8-bit).",
        "**CX (Count Register)**: Primarily serves as a *loop counter* in instructions like LOOP, string operations (REP), and shift/rotate instructions. It decrements automatically during these operations. It can be accessed as CH (high 8-bit) and CL (low 8-bit).",
        "**DX (Data Register)**: Used for I/O port addressing in some instructions and as an extension to AX for 32-bit arithmetic operations (e.g., in multiplication, DX stores the high 16-bits of the product). It can be accessed as DH (high 8-bit) and DL (low 8-bit).",
      ],
    },
    {
      heading: "Pointer and Index Registers",
      type: "text",
      content: [
        "These 16-bit registers are typically used to store *offset addresses* within a segment.",
        "**SP (Stack Pointer)**: Always points to the *top of the stack* in the Stack Segment (SS). It's automatically adjusted by PUSH, POP, CALL, and RET instructions.",
        "**BP (Base Pointer)**: Used to point to data within the *stack segment*, often used to access parameters passed on the stack during subroutine calls. It allows addressing based on the stack base.",
        "**SI (Source Index)**: Primarily used as an *index register* for string operations, pointing to the source operand in the Data Segment (DS).",
        "**DI (Destination Index)**: Primarily used as an *index register* for string operations, pointing to the destination operand in the Extra Segment (ES).",
      ],
    },
    {
      heading: "Segment Registers",
      type: "text",
      content: [
        "The 8086 uses a segmented memory architecture, allowing it to address 1 MB of physical memory using 16-bit registers. These 16-bit segment registers store the *starting address (base address)* of different memory segments.",
        "The actual 20-bit physical address is calculated as: **Physical Address = (Segment Register * 10h) + Offset Register.**",
        "**CS (Code Segment Register)**: Stores the base address of the *code segment*, where executable instructions are located.",
        "**DS (Data Segment Register)**: Stores the base address of the *data segment*, where program data is typically stored.",
        "**SS (Stack Segment Register)**: Stores the base address of the *stack segment*, used for temporary data storage and subroutine calls.",
        "**ES (Extra Segment Register)**: An additional segment register, often used for extra data or string operations, especially as a destination for string manipulations.",
      ],
    },
    {
      heading: "Instruction Pointer (IP)",
      type: "text",
      content: [
        "This 16-bit register, along with the Code Segment (CS) register, holds the *address of the next instruction* to be fetched and executed.",
        "It always contains the *offset* of the next instruction relative to the start of the current code segment.",
        "The **Physical Address of the next instruction = (CS * 10h) + IP.**",
        "IP is automatically updated by the CPU after each instruction fetch, and by control transfer instructions like JUMP, CALL, and RET.",
      ],
    },
    {
      heading: "Flags Register (FR)",
      type: "text",
      content: [
        "This is a 16-bit register that contains a collection of *status flags* and *control flags*.",
        "Each flag is a single bit that indicates the result of an arithmetic or logical operation or controls certain CPU operations.",
        "**Status Flags (Conditional Flags):**",
        "- CF (Carry Flag): Set if there is an *unsigned overflow* (carry out of MSB or borrow into MSB) during an arithmetic operation.",
        "- PF (Parity Flag): Set if the result has an *even number of 1s* (even parity); cleared otherwise.",
        "- AF (Auxiliary Carry Flag): Set if there is a *carry or borrow* between the lower nibble (bit 3) and the upper nibble (bit 4) during an arithmetic operation (used for BCD arithmetic).",
        "- ZF (Zero Flag): Set if the result of an operation is *zero*; cleared otherwise.",
        "- SF (Sign Flag): Set if the result is *negative* (MSB is 1); cleared otherwise.",
        "- OF (Overflow Flag): Set if there is a *signed overflow* during an arithmetic operation (result is too large/small for the destination).",
        "**Control Flags:**",
        "- TF (Trap Flag): When set, the processor enters *single-step mode*, generating an internal interrupt after each instruction execution. Useful for debugging.",
        "- IF (Interrupt Enable Flag): When set, the CPU *recognizes external maskable interrupts*; cleared to disable them.",
        "- DF (Direction Flag): Controls the direction of string operations. When cleared (DF=0), string operations proceed from *lower address to higher address (increment)*; when set (DF=1), they proceed from *higher address to lower address (decrement)*.",
      ],
    },
  ],
};

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 border border-gray-200">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-8 leading-tight">
          {registerData.title}
        </h1>

        {/* Sections */}
        {registerData.sections.map((section, index) => (
          <div key={index} className="mb-8 last:mb-0">
            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
              {section.heading}
            </h2>
            {/* Horizontal Line for separation */}
            <hr className="my-4 border-gray-300" />

            {/* Section Content */}
            {section.type === "text" && (
              <div className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-3">
                {(() => {
                  const renderedElements = [];
                  let currentListItems = [];

                  section.content.forEach((paragraph, pIndex) => {
                    const isListItem = paragraph.startsWith("- ");

                    if (isListItem) {
                      // Add to current list
                      currentListItems.push(
                        <li
                          key={pIndex}
                          dangerouslySetInnerHTML={{
                            __html: paragraph
                              .substring(2) // Remove '- '
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(
                                /`(.*?)`/g,
                                '<span class="font-mono bg-gray-100 px-1 py-0.5 rounded text-sm">$1</span>'
                              )
                              .replace(/\\/g, "")
                              .replace(
                                /\$\$(.*?)\$\$/g,
                                '<span class="latex-display block text-center my-4 text-xl font-mono">$1</span>'
                              )
                              .replace(
                                /\$(.*?)\$/g,
                                '<span class="latex-inline font-mono">$1</span>'
                              ),
                          }}
                        />
                      );
                    } else {
                      // If there were list items, close the list and add it
                      if (currentListItems.length > 0) {
                        renderedElements.push(
                          <ul
                            key={`list-${pIndex}-before-para`}
                            className="list-disc list-inside ml-4"
                          >
                            {currentListItems}
                          </ul>
                        );
                        currentListItems = []; // Reset for next list
                      }
                      // Add the current paragraph
                      renderedElements.push(
                        <p
                          key={pIndex}
                          dangerouslySetInnerHTML={{
                            __html: paragraph
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(
                                /`(.*?)`/g,
                                '<span class="font-mono bg-gray-100 px-1 py-0.5 rounded text-sm">$1</span>'
                              )
                              .replace(/\\/g, "")
                              .replace(
                                /\$\$(.*?)\$\$/g,
                                '<span class="latex-display block text-center my-4 text-xl font-mono">$1</span>'
                              )
                              .replace(
                                /\$(.*?)\$/g,
                                '<span class="latex-inline font-mono">$1</span>'
                              ),
                          }}
                        />
                      );
                    }
                  });

                  // After the loop, if there are any remaining list items, add them
                  if (currentListItems.length > 0) {
                    renderedElements.push(
                      <ul
                        key={`list-final-${section.heading}`}
                        className="list-disc list-inside ml-4"
                      >
                        {currentListItems}
                      </ul>
                    );
                  }

                  return renderedElements;
                })()}
              </div>
            )}
            {/* Add more types if needed (e.g., 'image', 'list') */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
