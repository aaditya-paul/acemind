import {NextResponse} from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {topic, subtopic, unitTitle, syllabus, count = 4} = body;

    // Validate required fields
    if (!topic || !subtopic) {
      return NextResponse.json(
        {error: "Topic and subtopic are required"},
        {status: 400}
      );
    }

    // Here you would typically call your AI service (OpenAI, Claude, etc.)
    // For now, I'll provide a mock implementation
    // Replace this with your actual AI service call

    const prompt = `
Given the following context:
- Main Topic: ${topic}
- Unit: ${unitTitle}
- Current Subtopic: ${subtopic}
- Syllabus Context: ${syllabus}

Generate ${count} specific, detailed subtopics that expand on "${subtopic}". 
Each subtopic should be:
1. More specific than the original subtopic
2. Relevant to the unit and main topic
3. Practical and educational
4. Unique and non-overlapping

Return only an array of strings, each representing a subtopic title.
`;

    // Mock response - replace with actual AI API call
    const mockExpandedSubtopics = generateMockSubtopics(subtopic, count);

    return NextResponse.json({
      success: true,
      subtopics: mockExpandedSubtopics, // Changed from expandedSubtopics to subtopics
      expandedSubtopics: mockExpandedSubtopics, // Keep backward compatibility
      originalSubtopic: subtopic,
      count: mockExpandedSubtopics.length,
    });
  } catch (error) {
    console.error("Error in expand-subtopics API:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

// Mock function to generate subtopics - replace with actual AI implementation
function generateMockSubtopics(originalSubtopic, count) {
  const subtopicMap = {
    "IoT definition": [
      "IoT fundamental concepts and terminology",
      "IoT vs traditional computing systems",
      "IoT ecosystem components and relationships",
      "IoT standards and specifications overview",
    ],
    "IoT ecosystem": [
      "IoT device manufacturers and vendors",
      "IoT platform providers and services",
      "IoT connectivity providers and networks",
      "IoT application developers and integrators",
    ],
    "Technology drivers": [
      "Semiconductor miniaturization trends",
      "Wireless communication advancements",
      "Cloud computing infrastructure growth",
      "Edge computing capabilities evolution",
    ],
    "Business drivers": [
      "Cost reduction through automation",
      "Revenue generation through new services",
      "Operational efficiency improvements",
      "Customer experience enhancement strategies",
    ],
    "IoT protocol standardization": [
      "IEEE 802.11 (WiFi) for IoT applications",
      "Bluetooth Low Energy (BLE) protocols",
      "LoRaWAN for long-range communication",
      "NB-IoT for cellular IoT connectivity",
    ],
    "M2M & WSN protocols": [
      "Machine-to-Machine communication standards",
      "Wireless Sensor Network topologies",
      "Data aggregation in sensor networks",
      "Energy-efficient communication protocols",
    ],
    "Arduino programming": [
      "Arduino IDE setup and configuration",
      "Basic Arduino sketch structure",
      "Digital and analog I/O programming",
      "Arduino libraries and their usage",
    ],
    "Sensors/actuators integration": [
      "Temperature and humidity sensor interfacing",
      "Motor control and servo programming",
      "LED matrices and display integration",
      "Sensor data calibration techniques",
    ],
  };

  // Return specific subtopics if available, otherwise generate generic ones
  if (subtopicMap[originalSubtopic]) {
    return subtopicMap[originalSubtopic].slice(0, count);
  }

  // Generic fallback
  const genericSubtopics = [];
  for (let i = 1; i <= count; i++) {
    genericSubtopics.push(`${originalSubtopic} - Advanced Topic ${i}`);
  }

  return genericSubtopics;
}
