import React, { useState } from "react";
import { Users, Plus, Calendar, CheckCircle2, MessageSquare, ArrowUpRight, X, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function CollaborationView({ groups, onToggleMembership, onCreateGroup, notify, loading }) {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Database Systems");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("Mon, Wed at 5:00 PM");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await onCreateGroup({
        name: name.trim(),
        subject,
        description: description.trim(),
        meetingSchedule: schedule.trim(),
        userId: user?.id,
      });
      notify("Study group created successfully!");
      setName("");
      setDescription("");
      setShowCreate(false);
    } catch {
      notify("Failed to create study group.");
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEER LEARNING CIRCLES</div>
          <h1>Study Groups & Collaboration</h1>
          <p>Join student-led study groups, prepare for technical exams together, and coordinate problem-solving sessions.</p>
        </div>
        <div className="heading-action">
          <button className="primary-button" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create study group
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading collaboration groups...</div>
      ) : groups.length === 0 ? (
        <div className="empty-state">No study groups currently active. Be the first to start one!</div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <div className={`group-card ${group.is_member ? "group-card-joined" : ""}`} key={group.id}>
              <div className="group-card-top">
                <span className="subject-tag">{group.subject}</span>
                <span className="members-badge">
                  <Users size={13} /> {group.member_count} {group.member_count === 1 ? "member" : "members"}
                </span>
              </div>

              <h3>{group.name}</h3>
              <p className="group-desc">{group.description}</p>

              <div className="group-schedule">
                <Calendar size={14} />
                <span>{group.meeting_schedule || "Weekly virtual sync"}</span>
              </div>

              <div className="group-card-footer">
                <button
                  className={group.is_member ? "secondary-button small" : "primary-button small"}
                  onClick={async () => {
                    await onToggleMembership(group.id);
                    notify(group.is_member ? "Left study group." : "Joined study group!");
                  }}
                >
                  {group.is_member ? (
                    <>
                      <CheckCircle2 size={13} /> Member
                    </>
                  ) : (
                    "Join Group"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">COMMUNITY COLLABORATION</span>
                <h2>Start a Study Group</h2>
              </div>
              <button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close">
                <X size={19} />
              </button>
            </div>
            <p className="modal-subtitle">Bring together classmates to review assignments and prepare for exams.</p>

            <form onSubmit={handleCreate}>
              <label className="field-label">Group Name</label>
              <input
                className="form-input"
                placeholder="e.g. Algorithms Sprint Squad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className="field-label">Subject</label>
              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option>Database Systems</option>
                <option>Data Structures</option>
                <option>Artificial Intelligence</option>
                <option>Software Engineering</option>
                <option>Computer Networks</option>
              </select>

              <label className="field-label">Meeting Schedule</label>
              <input
                className="form-input"
                placeholder="e.g. Tuesdays & Thursdays at 6:00 PM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />

              <label className="field-label">Goal / Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="What will this group focus on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={!name.trim()}>
                  Launch Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

