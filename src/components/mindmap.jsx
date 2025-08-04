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
import SubtopicSidebar from "./SubtopicSidebar";
import "@/styles/mindmap.css";
// Custom Node Components
const CourseNode = ({data}) => (
  <div className="group relative">
    <Handle
      type="source"
      position={Position.Right}
      className="w-4 h-4 bg-yellow-400 border-2 border-yellow-600"
    />
    <div className="w-[280px] h-[140px] px-6 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl border border-yellow-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm flex flex-col justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-3 h-3 bg-gray-900 rounded-full mr-2"></div>
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Course
          </span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
          {data.title}
        </h3>
        {data.description && (
          <p className="text-xs text-gray-800 mt-2 opacity-90 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const UnitNode = ({data}) => (
  <div className="group relative">
    <Handle
      type="target"
      position={Position.Left}
      className="w-4 h-4 bg-gray-400 border-2 border-gray-500"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="w-4 h-4 bg-gray-400 border-2 border-gray-500"
    />

    <div
      className={`w-[280px] h-[140px] px-5 py-4 rounded-xl border transition-all duration-300 backdrop-blur-sm flex flex-col justify-center ${
        data.isExpanded
          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40 shadow-lg"
          : "bg-gray-800/90 border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-750/90"
      } shadow-lg hover:shadow-xl`}
    >
      <button
        onClick={data.onPlusClick}
        className={`absolute -top-4 -right-4 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-200 z-10 ${
          data.isExpanded
            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400"
            : "bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
        }`}
      >
        {data.isExpanded ? "−" : "+"}
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              data.isExpanded ? "bg-yellow-400" : "bg-gray-400"
            }`}
          ></div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              data.isExpanded ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            Unit {data.unit_num}
          </span>
        </div>
        <h4
          className={`font-bold text-sm leading-tight mb-2 line-clamp-2 ${
            data.isExpanded ? "text-yellow-100" : "text-white"
          }`}
        >
          {data.title}
        </h4>
        {data.duration !== undefined &&
          data.duration !== null &&
          data.duration > 0 && (
            <div className="flex items-center justify-center mt-2">
              <svg
                className="w-3 h-3 text-gray-400 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-gray-400 font-medium">
                {data.duration} Hours
              </span>
            </div>
          )}
      </div>
    </div>
  </div>
);

const SubTopicNode = ({data}) => (
  <div className="group relative">
    <Handle
      type="target"
      position={Position.Left}
      className="w-3 h-3 bg-gray-500 border-2 border-gray-600"
    />

    <div
      className="w-[280px] h-[140px] px-5 py-4 bg-gray-800/50 hover:bg-gray-700/90 rounded-lg border border-gray-600/50 hover:border-gray-500/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-center"
      onClick={data.onNodeClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent node click when button is clicked
          data.onPlusClick();
        }}
        className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 hover:bg-green-400 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 z-10 hover:scale-110"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Topic
          </span>
        </div>
        <p className="text-sm text-gray-200 font-medium leading-snug group-hover:text-white transition-colors line-clamp-4">
          {data.title}
        </p>
      </div>
    </div>
  </div>
);

// Node types
const nodeTypes = {
  course: CourseNode,
  unit: UnitNode,
  subtopic: SubTopicNode,
};

function MindMap({
  chatData,
  chatId,
  mindmapState,
  closeSidebar,
  openSidebar,
  setSelectedSubTopic,
}) {
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
  const [sidebarState, setSidebarState] = React.useState({
    isOpen: false,
    subtopicData: null,
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

    // Reset viewport and force nodes to default positions
    setTimeout(() => {
      if (reactFlowInstance.current) {
        // Force all nodes to their default calculated positions by clearing any saved positions
        const currentNodes = reactFlowInstance.current.getNodes();
        const resetNodes = currentNodes.map((node) => {
          // Force recalculation by removing any saved position influence
          if (node.id === "subject") {
            return {...node, position: {x: 50, y: 400}};
          }
          return node;
        });

        reactFlowInstance.current.setNodes(resetNodes);

        // Smooth fit view to show the reset layout
        setTimeout(() => {
          reactFlowInstance.current.fitView({
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5,
            duration: 500, // Smooth transition duration
          });
        }, 100);
      }
    }, 150);

    showModal(
      "info",
      "Reset Complete",
      "Mindmap has been reset to default state"
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

  const handleSubTopicPlusClick = (
    unitIndex,
    subTopicIndex,
    subtopicTitle,
    unitTitle,
    unitNumber
  ) => {
    console.log(
      `Subtopic PLUS button clicked: Unit ${unitIndex + 1}, Subtopic ${
        subTopicIndex + 1
      } - Add functionality here`
    );

    // TODO: Add functionality for the plus button (e.g., add notes, mark as favorite, etc.)
  };

  const handleSubTopicNodeClick = (
    unitIndex,
    subTopicIndex,
    subtopicTitle,
    unitTitle,
    unitNumber
  ) => {
    openSidebar();
    setSelectedSubTopic({
      unitIndex,
      subTopicIndex,
      subtopicTitle,
      unitTitle,
      unitNumber,
    });
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

    // Get saved node positions if available (but not during reset)
    const savedNodePositions = mindmapState?.nodePositions || {};

    // Subject/Topic node (leftmost) - always use default position for consistent layout
    const subjectPosition = {x: 50, y: 400};
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

    // Calculate dynamic spacing based on expanded units and their subtopic counts
    let totalRequiredHeight = 0;
    const unitSpacingData = [];

    unitsToShow.forEach((unit, unitIndex) => {
      const isExpanded = expandedUnits.has(unitIndex);
      const subTopicsCount =
        isExpanded && unit.sub_topics ? unit.sub_topics.length : 0;
      const unitRequiredHeight = Math.max(140, subTopicsCount * 180); // Minimum unit height or subtopics height

      unitSpacingData.push({
        unitIndex,
        isExpanded,
        subTopicsCount,
        requiredHeight: unitRequiredHeight,
        yPosition: totalRequiredHeight,
      });

      totalRequiredHeight += unitRequiredHeight + 120; // Add spacing between units
    });

    const unitStartY = 400 - (totalRequiredHeight - 120) / 2; // Center all units vertically

    // Create unit nodes and their subtopics
    let currentSubTopicY = unitStartY; // Track the current Y position for subtopics

    // Get array of expanded unit indices for dynamic spacing calculation
    const expandedUnitIndices = unitsToShow
      .map((unit, index) => ({unit, index}))
      .filter(({index}) => expandedUnits.has(index))
      .map(({index}) => index);

    unitsToShow.forEach((unit, unitIndex) => {
      const unitId = `unit-${unit.unit_num || unitIndex}`;
      const spacingData = unitSpacingData[unitIndex];
      const unitY =
        unitStartY +
        spacingData.yPosition +
        spacingData.requiredHeight / 2 -
        70; // Center unit in its allocated space

      // Unit node (middle column) - always in order
      nodes.push({
        id: unitId,
        type: "unit",
        position: {x: 700, y: unitY}, // Fixed position to maintain order
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
        type: "default",
        style: {
          stroke: expandedUnits.has(unitIndex) ? "#f59e0b" : "#fbbf24",
          strokeWidth: expandedUnits.has(unitIndex) ? 3 : 2,
          strokeDasharray: expandedUnits.has(unitIndex) ? "none" : "5,5",
        },
        animated: expandedUnits.has(unitIndex),
      });

      // Show subtopics only for expanded units
      if (
        expandedUnits.has(unitIndex) &&
        unit.sub_topics &&
        Array.isArray(unit.sub_topics)
      ) {
        const subTopicsToShow = unit.sub_topics;
        const subTopicsCount = subTopicsToShow.length;

        // Calculate subtopic positions to center them around the unit node
        const totalSubTopicsHeight = (subTopicsCount - 1) * 180; // Total height span of subtopics
        const subTopicsStartY = unitY - totalSubTopicsHeight / 2; // Center subtopics around unit Y position

        subTopicsToShow.forEach((subTopic, subIndex) => {
          const subTopicId = `subtopic-${
            unit.unit_num || unitIndex
          }-${subIndex}`;
          const subTopicY = subTopicsStartY + subIndex * 180; // Position relative to unit center

          // Improved horizontal spacing to prevent overlaps
          const expandedUnitPosition = expandedUnitIndices.indexOf(unitIndex);
          const baseSubTopicX = 1200;
          const horizontalSpacing = 350; // Increased spacing between expanded units' subtopics
          const subTopicX =
            baseSubTopicX + expandedUnitPosition * horizontalSpacing;

          // Subtopic node
          nodes.push({
            id: subTopicId,
            type: "subtopic",
            position: {x: subTopicX, y: subTopicY}, // Better positioned to avoid overlaps
            data: {
              title:
                typeof subTopic === "string"
                  ? subTopic
                  : subTopic.title || `Subtopic ${subIndex + 1}`,
              onNodeClick: () =>
                handleSubTopicNodeClick(
                  unitIndex,
                  subIndex,
                  typeof subTopic === "string"
                    ? subTopic
                    : subTopic.title || `Subtopic ${subIndex + 1}`,
                  unit.title,
                  unit.unit_num || unitIndex + 1
                ),
              onPlusClick: () =>
                handleSubTopicPlusClick(
                  unitIndex,
                  subIndex,
                  typeof subTopic === "string"
                    ? subTopic
                    : subTopic.title || `Subtopic ${subIndex + 1}`,
                  unit.title,
                  unit.unit_num || unitIndex + 1
                ),
            },
          }); // Edge from unit to subtopic
          edges.push({
            id: `${unitId}-${subTopicId}`,
            source: unitId,
            target: subTopicId,
            type: "default",
            style: {
              stroke: "#10b981",
              strokeWidth: 2,
              strokeDasharray: "3,3",
            },
            animated: true,
          });
        });
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

  // If no data provided, show placeholder
  if (!chatData) {
    return (
      <div className="">
        <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-xl">
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-white mb-2">Mind Map</h3>
            <p className="text-gray-400">No course data available to display</p>
          </div>
        </div>
        {/* ============================= */}
        <div>HIi</div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-screen md:h-screen bg-gray-900 rounded-xl md:overflow-y-auto overflow-y-hidden relative transition-all duration-300 ${
        sidebarState.isOpen ? "mr-96" : "mr-0"
      }`}
    >
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
        <Background
          color="#374151"
          gap={24}
          size={1}
          className="bg-gray-900 opacity-40"
          variant="dots"
        />
      </ReactFlow>
    </div>
  );
}

export default MindMap;
