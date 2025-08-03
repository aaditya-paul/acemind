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
  <div className="px-4 py-3 shadow-md rounded-lg bg-gray-800 border-2 border-gray-600 min-w-[180px]">
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="text-center">
      <h4 className="font-semibold text-white">Unit {data.unit_num}</h4>
      <p className="text-sm text-gray-300 mt-1">{data.title}</p>
      {data.duration && (
        <p className="text-xs text-gray-400 mt-1">{data.duration}</p>
      )}
    </div>
  </div>
);

const SubTopicNode = ({data}) => (
  <div className="px-3 py-2 shadow-sm rounded-lg bg-gray-700 border border-gray-500 min-w-[150px]">
    <Handle type="target" position={Position.Left} className="w-2 h-2" />
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
  // Generate nodes and edges from chatData
  const {initialNodes, initialEdges} = useMemo(() => {
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
      position: {x: 50, y: 200},
      data: {
        title: courseData.courseTitle || courseData.title || "Subject",
        description: "",
      },
    });

    // Calculate vertical spacing for units
    const unitCount = courseData.units.length;
    const unitStartY = 200 - ((unitCount - 1) * 100) / 2; // Center units vertically

    // Create unit nodes and their subtopics
    courseData.units.forEach((unit, unitIndex) => {
      const unitId = `unit-${unit.unit_num || unitIndex}`;
      const unitY = unitStartY + unitIndex * 100;

      // Unit node (middle column)
      nodes.push({
        id: unitId,
        type: "unit",
        position: {x: 350, y: unitY},
        data: {
          unit_num: unit.unit_num || unitIndex + 1,
          title: unit.title,
          duration: unit.duration,
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

      // Subtopics for this unit (rightmost)
      if (unit.sub_topics && Array.isArray(unit.sub_topics)) {
        const subTopicCount = unit.sub_topics.length;
        const subTopicStartY = unitY - ((subTopicCount - 1) * 60) / 2; // Center subtopics around unit

        unit.sub_topics.forEach((subTopic, subIndex) => {
          const subTopicId = `subtopic-${
            unit.unit_num || unitIndex
          }-${subIndex}`;
          const subTopicY = subTopicStartY + subIndex * 60;

          // Subtopic node
          nodes.push({
            id: subTopicId,
            type: "subtopic",
            position: {x: 650, y: subTopicY},
            data: {
              title:
                typeof subTopic === "string"
                  ? subTopic
                  : subTopic.title || `Subtopic ${subIndex + 1}`,
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
      }
    });

    return {initialNodes: nodes, initialEdges: edges};
  }, [chatData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
        // fitView
        attributionPosition="bottom-left"
        className="bg-gray-900"
        // defaultViewport={{x: 0, y: 0, zoom: 0.8}}
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
