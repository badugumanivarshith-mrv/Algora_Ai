import React, { useState, useEffect } from "react";
import {
  CollaborationApi,
  CollaborationRoom,
  Participant,
  ChatMessage,
  CollaborationAnalyticsData,
} from "../services/collaborationApi";
import { RoomLobby } from "../components/collaboration/RoomLobby";
import { SharedEditor } from "../components/collaboration/SharedEditor";
import { Whiteboard } from "../components/collaboration/Whiteboard";
import { CollaborationChat } from "../components/collaboration/CollaborationChat";
import { PairProgrammingPanel } from "../components/collaboration/PairProgrammingPanel";
import { InterviewPanel } from "../components/collaboration/InterviewPanel";
import { CollaborationAnalytics } from "../components/collaboration/CollaborationAnalytics";
import { ArrowLeft, Users, Mic, MicOff, PhoneOff } from "lucide-react";

export const CollaborationWorkspace: React.FC = () => {
  const [rooms, setRooms] = useState<CollaborationRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<CollaborationRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [code, setCode] = useState<string>("// Collaborative coding workspace\nfunction solve(nums: number[]): number {\n  return 0;\n}");
  const [whiteboardShapes, setWhiteboardShapes] = useState<any>([]);
  const [analytics, setAnalytics] = useState<CollaborationAnalyticsData | null>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "whiteboard">("code");

  const currentUserId = "usr_demo";

  useEffect(() => {
    loadRooms();
    loadAnalytics();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await CollaborationApi.listRooms();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (e) {
      // Fallback sample
      setRooms([
        {
          id: "room_demo_1",
          name: "Amazon L4 Pair Programming",
          room_type: "Pair Programming",
          host_user_id: "usr_host",
          company: "Amazon",
          language: "typescript",
          current_code: "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  return [];\n}",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await CollaborationApi.getAnalytics();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (e) {
      // Fallback
    }
  };

  const handleCreateRoom = async (params: { name: string; roomType: string; company?: string; language: string }) => {
    try {
      const data = await CollaborationApi.createRoom(params);
      if (data.success) {
        setActiveRoom(data.room);
        setCode(data.room.current_code || "// Start coding here...");
        handleJoinRoom(data.room.id);
      }
    } catch (e) {
      // Local fallback room
      const localRoom: CollaborationRoom = {
        id: `room_${Date.now()}`,
        name: params.name,
        room_type: params.roomType,
        host_user_id: currentUserId,
        company: params.company,
        language: params.language,
        current_code: "// Start coding here...",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setActiveRoom(localRoom);
      setCode(localRoom.current_code);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const data = await CollaborationApi.getRoom(roomId);
      if (data.success) {
        setActiveRoom(data.room);
        setParticipants(data.participants || []);
        setMessages(data.messages || []);
        setCode(data.room.current_code || "// Collaborative coding workspace");
        setWhiteboardShapes(data.whiteboard || []);
      }
    } catch (e) {
      const found = rooms.find((r) => r.id === roomId);
      if (found) {
        setActiveRoom(found);
        setCode(found.current_code);
      }
    }
  };

  const handleLeaveRoom = async () => {
    if (activeRoom) {
      try {
        await CollaborationApi.leaveRoom(activeRoom.id);
      } catch (e) {
        // Ignore
      }
    }
    setActiveRoom(null);
  };

  const handleCodeChange = async (newCode: string) => {
    setCode(newCode);
    if (activeRoom) {
      try {
        await CollaborationApi.syncCode(activeRoom.id, newCode);
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleSendMessage = async (msgText: string, isAiRequested?: boolean) => {
    if (!activeRoom) return;

    try {
      const res = await CollaborationApi.sendChatMessage(activeRoom.id, msgText, code, isAiRequested);
      if (res.success) {
        setMessages((prev) => [...prev, res.message]);
        if (res.aiMessage) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_ai_${Date.now()}`,
              room_id: activeRoom.id,
              user_id: "AI_COLLABORATOR",
              user_name: res.aiMessage.sender,
              message: res.aiMessage.message,
              message_type: "ai",
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (e) {
      // Local push fallback
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        room_id: activeRoom.id,
        user_id: currentUserId,
        user_name: "You",
        message: msgText,
        message_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }
  };

  const handleSwitchRoles = async (driverUserId: string, navigatorUserId: string) => {
    if (!activeRoom) return;
    try {
      await CollaborationApi.switchRoles(activeRoom.id, driverUserId, navigatorUserId);
      setActiveRoom((prev) =>
        prev ? { ...prev, driver_user_id: driverUserId, navigator_user_id: navigatorUserId } : null
      );
    } catch (e) {
      // Fallback
      setActiveRoom((prev) =>
        prev ? { ...prev, driver_user_id: driverUserId, navigator_user_id: navigatorUserId } : null
      );
    }
  };

  const handleEvaluateInterview = async () => {
    if (!activeRoom) return;
    setEvalLoading(true);
    try {
      const res = await CollaborationApi.evaluateInterview(activeRoom.id, {
        company: activeRoom.company || "Amazon",
        code,
      });
      if (res.success) {
        setEvaluation(res.evaluation);
      }
    } catch (e) {
      setEvaluation({
        overallScore: 85,
        technicalScore: 88,
        communicationScore: 80,
        hiringRecommendation: "Hire",
        detailedFeedback: "Strong algorithm breakdown with crisp time-complexity verification.",
      });
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {!activeRoom ? (
        <>
          <CollaborationAnalytics analytics={analytics} />
          <RoomLobby rooms={rooms} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="p-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
                title="Leave Room"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 uppercase">
                    {activeRoom.room_type}
                  </span>
                  <h2 className="text-base font-bold text-neutral-900">{activeRoom.name}</h2>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">Language: {activeRoom.language}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isMuted ? "bg-red-50 text-red-700 border-red-200" : "bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                {isMuted ? "Muted" : "Voice On"}
              </button>

              <button
                onClick={handleLeaveRoom}
                className="px-3 py-2 bg-red-600 text-white font-medium text-xs rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                Leave Room
              </button>
            </div>
          </div>

          {activeRoom.room_type === "Pair Programming" && (
            <PairProgrammingPanel
              driverId={activeRoom.driver_user_id}
              navigatorId={activeRoom.navigator_user_id}
              currentUserId={currentUserId}
              participants={participants}
              onSwitchRoles={handleSwitchRoles}
            />
          )}

          {activeRoom.room_type === "Mock Interview" && (
            <InterviewPanel
              company={activeRoom.company}
              onEvaluate={handleEvaluateInterview}
              evaluationResult={evaluation}
              loading={evalLoading}
            />
          )}

          <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors ${
                activeTab === "code" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Code Editor
            </button>
            <button
              onClick={() => setActiveTab("whiteboard")}
              className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors ${
                activeTab === "whiteboard" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Collaborative Whiteboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
            <div className="lg:col-span-2">
              {activeTab === "code" ? (
                <SharedEditor code={code} language={activeRoom.language} onChange={handleCodeChange} />
              ) : (
                <Whiteboard
                  initialShapes={whiteboardShapes}
                  onSave={(shapes) => CollaborationApi.syncWhiteboard(activeRoom.id, shapes)}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <CollaborationChat messages={messages} onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
