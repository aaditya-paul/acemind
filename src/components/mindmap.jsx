"use client";

import React, {useCallback, useMemo} from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom Node Components
const CourseNode = ({data}) => (
  <div className="px-6 py-4 shadow-lg rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-yellow-600 min-w-[200px]">
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="text-center">
      <h3 className="font-bold text-lg text-gray-900">{data.title}</h3>
      <p className="text-sm text-gray-800 mt-1">{data.description}</p>
    </div>
  </div>
);

const UnitNode = ({data}) => (
  <div className="px-4 py-3 shadow-md rounded-lg bg-gray-800 border-2 border-gray-600 min-w-[180px] relative">
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <button
      onClick={data.onPlusClick}
      className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-colors z-10"
    >
      {data.isExpanded ? "−" : "+"}
    </button>
    <div className="text-center">
      <h4 className="font-semibold text-white">Unit {data.unit_num}</h4>
      <p className="text-sm text-gray-300 mt-1">{data.title}</p>
      {data.duration !== undefined && data.duration !== null && (
        <p className="text-xs text-gray-400 mt-1">
          {data.duration === 0
            ? null
            : "Duration : " + data.duration + " Hours"}
        </p>
      )}
    </div>
  </div>
);

const SubTopicNode = ({data}) => (
  <div className="px-3 py-2 shadow-sm rounded-lg bg-gray-700 border border-gray-500 min-w-[150px] relative">
    <Handle type="target" position={Position.Left} className="w-2 h-2" />
    <button
      onClick={data.onPlusClick}
      className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-colors z-10"
    >
      +
    </button>
    <div className="text-center">
      <p className="text-sm text-gray-200 font-medium">{data.title}</p>
    </div>
  </div>
);

// Node types
const nodeTypes = {
  course: CourseNode,
  unit: UnitNode,
  subtopic: SubTopicNode,
};

function MindMap({chatData}) {
  const [expandedUnits, setExpandedUnits] = React.useState(new Set([0])); // First unit expanded by default

  const handleUnitPlusClick = (unitIndex) => {
    console.log("Unit plus clicked:", unitIndex);
    // Toggle the clicked unit - expand if collapsed, collapse if expanded
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitIndex)) {
        // Unit is expanded, so collapse it
        newSet.delete(unitIndex);
      } else {
        // Unit is collapsed, so expand it
        newSet.add(unitIndex);
      }
      return newSet;
    });
  };

  const handleSubTopicPlusClick = (unitIndex, subTopicIndex) => {
    console.log(
      `Subtopic plus clicked: Unit ${unitIndex + 1}, Subtopic ${
        subTopicIndex + 1
      }`
    );
  };

  // Generate nodes and edges from chatData
  const {initialNodes, initialEdges} = React.useMemo(() => {
    console.log("ChatData received:", chatData); // Debug log

    if (!chatData) {
      return {initialNodes: [], initialEdges: []};
    }

    // Handle different data structures
    let courseData;
    if (chatData.aiResponse) {
      // If chatData has aiResponse property, parse it
      try {
        courseData =
          typeof chatData.aiResponse === "string"
            ? JSON.parse(chatData.aiResponse)
            : chatData.aiResponse;
      } catch (e) {
        console.error("Error parsing aiResponse:", e);
        return {initialNodes: [], initialEdges: []};
      }
    } else {
      // Direct data structure
      courseData = chatData;
    }

    if (!courseData || !courseData.units || !Array.isArray(courseData.units)) {
      console.log("No units found in courseData:", courseData);
      return {initialNodes: [], initialEdges: []};
    }

    const nodes = [];
    const edges = [];

    // Subject/Topic node (leftmost)
    nodes.push({
      id: "subject",
      type: "course",
      position: {x: 50, y: 400},
      data: {
        title: chatData.topic || courseData.courseTitle || "Subject",
        description: "",
      },
    });

    // Determine which units to show - show all units
    const unitsToShow = courseData.units;
    const unitCount = unitsToShow.length;
    const unitStartY = 400 - ((unitCount - 1) * 200) / 2; // Center units vertically with much more spacing

    // Create unit nodes and their subtopics
    let currentSubTopicY = unitStartY; // Track the current Y position for subtopics

    // Get array of expanded unit indices for dynamic spacing calculation
    const expandedUnitIndices = unitsToShow
      .map((unit, index) => ({unit, index}))
      .filter(({index}) => expandedUnits.has(index))
      .map(({index}) => index);

    unitsToShow.forEach((unit, unitIndex) => {
      const unitId = `unit-${unit.unit_num || unitIndex}`;
      const unitY = unitStartY + unitIndex * 200; // Much more spacing between units

      // Unit node (middle column)
      nodes.push({
        id: unitId,
        type: "unit",
        position: {x: 600, y: unitY}, // Adjusted horizontal spacing from subject
        data: {
          unit_num: unit.unit_num || unitIndex + 1,
          title: unit.title,
          duration: unit.duration,
          isExpanded: expandedUnits.has(unitIndex),
          onPlusClick: () => handleUnitPlusClick(unitIndex),
        },
      });

      // Edge from subject to unit
      edges.push({
        id: `subject-${unitId}`,
        source: "subject",
        target: unitId,
        type: "smoothstep",
        style: {stroke: "#fbbf24", strokeWidth: 2},
      });

      // Show subtopics only for expanded units (first unit expanded by default)
      if (
        expandedUnits.has(unitIndex) &&
        unit.sub_topics &&
        Array.isArray(unit.sub_topics)
      ) {
        const subTopicsToShow = unit.sub_topics; // Show all subtopics

        subTopicsToShow.forEach((subTopic, subIndex) => {
          const subTopicId = `subtopic-${
            unit.unit_num || unitIndex
          }-${subIndex}`;
          const subTopicY = currentSubTopicY + subIndex * 120; // Use absolute positioning

          // Dynamic horizontal indentation based on expanded units order
          const expandedUnitPosition = expandedUnitIndices.indexOf(unitIndex);
          const totalExpandedUnits = expandedUnitIndices.length;
          const horizontalIndent =
            (totalExpandedUnits - expandedUnitPosition - 1) * 60; // Earlier expanded units get more space
          const subTopicX = 1100 + horizontalIndent;

          // Subtopic node
          nodes.push({
            id: subTopicId,
            type: "subtopic",
            position: {x: subTopicX, y: subTopicY}, // Dynamically indented based on expansion order
            data: {
              title:
                typeof subTopic === "string"
                  ? subTopic
                  : subTopic.title || `Subtopic ${subIndex + 1}`,
              onPlusClick: () => handleSubTopicPlusClick(unitIndex, subIndex),
            },
          });

          // Edge from unit to subtopic
          edges.push({
            id: `${unitId}-${subTopicId}`,
            source: unitId,
            target: subTopicId,
            type: "smoothstep",
            style: {stroke: "#6b7280", strokeWidth: 1},
          });
        });

        // Update the current Y position for next set of subtopics
        // Add some extra spacing between different unit's subtopics
        currentSubTopicY += subTopicsToShow.length * 120 + 40; // 40px gap between unit groups
      }
    });

    return {initialNodes: nodes, initialEdges: edges};
  }, [chatData, expandedUnits]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when dependencies change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // If no data provided, show placeholder
  if (!chatData) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-semibold text-white mb-2">Mind Map</h3>
          <p className="text-gray-400">No course data available to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[76vh] bg-gray-900 rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        className="bg-gray-900"
        defaultViewport={{x: 0, y: 0, zoom: 0.6}}
      >
        {/* <Controls className="bg-gray-800 border border-gray-600" /> */}
        {/* <MiniMap
          className="bg-gray-800 border border-gray-600"
          nodeColor={(node) => {
            switch (node.type) {
              case "course":
                return "#fbbf24";
              case "unit":
                return "#374151";
              case "subtopic":
                return "#6b7280";
              default:
                return "#9ca3af";
            }
          }}
        /> */}
        <Background color="#4b5563" gap={20} className="bg-gray-900" />
      </ReactFlow>
    </div>
  );
}

export default MindMap;
