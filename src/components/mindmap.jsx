"use client";

import React, {useCallback, useMemo, useRef} from "react";
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
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {useAuth} from "../contexts/AuthContext";
import {saveMindmapState} from "../lib/db";
import GeneralInfoModal from "./GeneralInfoModal";
import "@/styles/mindmap.css";
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

function MindMap({chatData, chatId, mindmapState}) {
  const {user} = useAuth();
  const reactFlowInstance = useRef(null);
  const [expandedUnits, setExpandedUnits] = React.useState(new Set([0])); // First unit expanded by default
  const [defaultViewport] = React.useState({x: 0, y: 0, zoom: 0.4});
  const [isLoading, setIsLoading] = React.useState(false);
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Load saved mindmap state on component mount
  React.useEffect(() => {
    if (mindmapState) {
      const {
        expandedUnits: savedExpanded,
        viewport,
        nodePositions,
      } = mindmapState;

      if (savedExpanded && Array.isArray(savedExpanded)) {
        setExpandedUnits(new Set(savedExpanded));
      }

      if (viewport && reactFlowInstance.current) {
        setTimeout(() => {
          reactFlowInstance.current.setViewport(viewport);
        }, 100);
      }

      // Apply saved node positions
      if (nodePositions && reactFlowInstance.current) {
        setTimeout(() => {
          const currentNodes = reactFlowInstance.current.getNodes();
          const updatedNodes = currentNodes.map((node) => ({
            ...node,
            position: nodePositions[node.id] || node.position,
          }));
          reactFlowInstance.current.setNodes(updatedNodes);
        }, 150);
      }
    }
  }, [mindmapState]);

  const showModal = (type, title, message) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({...prev, isOpen: false}));
  };

  const saveMindmapStateToDb = async () => {
    if (!chatId || !user?.uid || !reactFlowInstance.current) {
      showModal(
        "error",
        "Save Failed",
        "Unable to save: Missing required data"
      );
      return;
    }

    setIsLoading(true);
    try {
      const viewport = reactFlowInstance.current.getViewport();
      const nodes = reactFlowInstance.current.getNodes();

      const nodePositions = {};
      nodes.forEach((node) => {
        nodePositions[node.id] = node.position;
      });

      const mindmapStateToSave = {
        expandedUnits,
        viewport,
        nodePositions,
      };

      const result = await saveMindmapState(
        chatId,
        user.uid,
        mindmapStateToSave
      );

      if (result.success) {
        showModal("success", "Success", "Mindmap state saved successfully!");
      } else {
        showModal(
          "error",
          "Save Failed",
          result.message || "Failed to save mindmap state"
        );
      }
    } catch (error) {
      console.error("Error saving mindmap state:", error);
      showModal("error", "Error", "An unexpected error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const resetMindmapToDefault = () => {
    // Reset expanded units to default (first unit expanded)
    setExpandedUnits(new Set([0]));

    // Reset viewport and node positions to default after a short delay to ensure nodes are updated
    setTimeout(() => {
      if (reactFlowInstance.current) {
        // Reset viewport
        reactFlowInstance.current.setViewport(defaultViewport);

        // Reset node positions to default calculated positions
        const currentNodes = reactFlowInstance.current.getNodes();
        const resetNodes = currentNodes.map((node) => {
          let defaultPosition;

          if (node.id === "subject") {
            defaultPosition = {x: 50, y: 400};
          } else if (node.id.startsWith("unit-")) {
            // Extract unit index from ID and calculate default position
            const unitIndex = parseInt(node.id.split("-")[1]) || 0;
            const unitCount = currentNodes.filter((n) =>
              n.id.startsWith("unit-")
            ).length;
            const unitStartY = 400 - ((unitCount - 1) * 200) / 2;
            defaultPosition = {x: 600, y: unitStartY + unitIndex * 200};
          } else if (node.id.startsWith("subtopic-")) {
            // For subtopics, calculate default position based on expanded units
            const parts = node.id.split("-");
            const unitIndex = parseInt(parts[1]) || 0;
            const subIndex = parseInt(parts[2]) || 0;

            // Calculate default subtopic position
            const unitCount = currentNodes.filter((n) =>
              n.id.startsWith("unit-")
            ).length;
            const unitStartY = 400 - ((unitCount - 1) * 200) / 2;
            const baseSubTopicY = unitStartY + subIndex * 120;
            defaultPosition = {x: 1100, y: baseSubTopicY};
          } else {
            // Keep current position if we can't determine default
            defaultPosition = node.position;
          }

          return {
            ...node,
            position: defaultPosition,
          };
        });

        // Apply reset positions
        reactFlowInstance.current.setNodes(resetNodes);

        // Fit view after resetting positions
        reactFlowInstance.current.fitView({
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.5,
        });
      }
    }, 100);

    showModal(
      "info",
      "Reset Complete",
      "Mindmap has been reset to default state with original positions"
    );
  };

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

    // Get saved node positions if available
    const savedNodePositions = mindmapState?.nodePositions || {};

    // Subject/Topic node (leftmost)
    const subjectPosition = savedNodePositions["subject"] || {x: 50, y: 400};
    nodes.push({
      id: "subject",
      type: "course",
      position: subjectPosition,
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

      // Use saved position if available, otherwise use calculated position
      const unitPosition = savedNodePositions[unitId] || {x: 600, y: unitY};

      // Unit node (middle column)
      nodes.push({
        id: unitId,
        type: "unit",
        position: unitPosition,
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

          // Use saved position if available, otherwise use calculated position
          const subTopicPosition = savedNodePositions[subTopicId] || {
            x: subTopicX,
            y: subTopicY,
          };

          // Subtopic node
          nodes.push({
            id: subTopicId,
            type: "subtopic",
            position: subTopicPosition,
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
  }, [chatData, expandedUnits, mindmapState]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when dependencies change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
    <div className="w-full h-screen md:h-screen bg-gray-900 rounded-xl md:overflow-y-auto overflow-y-hidden relative">
      {/* General Info Modal */}
      <GeneralInfoModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* Control buttons - Mobile optimized positioning */}
      <div className="fixed md:absolute bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-4 right-4 z-30 flex gap-2">
        <button
          onClick={saveMindmapStateToDb}
          disabled={isLoading || !chatId || !user?.uid}
          className="px-4 py-2 bg-green-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Save State
            </>
          )}
        </button>
        <button
          onClick={resetMindmapToDefault}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset
        </button>
      </div>

      <ReactFlow
        ref={reactFlowInstance}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        className="bg-gray-900"
        defaultViewport={defaultViewport}
        nodesConnectable={false}
        panOnDrag={true}
        zoomOnPinch={true}
        zoomOnScroll={true}
        panOnScroll={false}
        minZoom={0.1}
        maxZoom={1.5}
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
