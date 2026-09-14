import React, { useState } from "react";
import { CollaborationRoom } from "../../services/collaborationApi";
import { Users, Plus, Code, Video, Building, BookOpen, Sparkles } from "lucide-react";

interface RoomLobbyProps {
  rooms: CollaborationRoom[];
  onCreateRoom: (data: { name: string; roomType: string; company?: string; language: string }) => void;
  onJoinRoom: (roomId: string) => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({ rooms, onCreateRoom, onJoinRoom }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [roomType, setRoomType] = useState("Pair Programming");
  const [company, setCompany] = useState("Amazon");
  const [language, setLanguage] = useState("typescript");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({
      name: name || `${roomType} Room`,
      roomType,
      company: roomType === "Mock Interview" ? company : undefined,
      language,
    });
    setIsModalOpen(false);
    setName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              v3.1 Real-Time
            </span>
            <h2 className="text-xl font-bold text-neutral-900">Collaboration Rooms</h2>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Solve problems together, pair program, conduct mock interviews, or study with AI guidance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white font-medium text-sm rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <Users className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 font-medium">No active collaboration rooms</p>
            <p className="text-sm text-neutral-400 mt-1">Create a new room to start pair programming or mock interviews.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                      room.room_type === "Mock Interview"
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : room.room_type === "Pair Programming"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}
                  >
                    {room.room_type}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 uppercase">{room.language}</span>
                </div>

                <h3 className="font-semibold text-neutral-900 text-base">{room.name}</h3>
                {room.company && (
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    Target: {room.company}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Users className="w-3.5 h-3.5" />
                  Active Session
                </div>
                <button
                  onClick={() => onJoinRoom(room.id)}
                  className="px-3.5 py-1.5 bg-neutral-900 text-white font-medium text-xs rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Join Workspace
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Create Collaboration Room</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amazon L4 Mock Interview"
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Room Type</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="Pair Programming">Pair Programming (Driver/Navigator)</option>
                  <option value="Mock Interview">Mock Interview (Interviewer/Candidate)</option>
                  <option value="Practice">Practice Room</option>
                  <option value="Contest Collaboration">Contest Collaboration</option>
                  <option value="Study Room">Study Room</option>
                </select>
              </div>

              {roomType === "Mock Interview" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Company</label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Google">Google</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Meta">Meta</option>
                    <option value="Adobe">Adobe</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-medium text-sm rounded-xl hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white font-medium text-sm rounded-xl hover:bg-neutral-800"
                >
                  Create & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
