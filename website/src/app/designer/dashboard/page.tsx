"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Briefcase, Star, LogOut, CheckCircle, Clock, Layout, Image as ImageIcon, Settings, Plus, Trash2, X, Upload } from "lucide-react";
import { get, put, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface PortfolioItem {
  _id?: string;
  image: string;
  title: string;
  description: string;
}

interface Project {
  _id: string;
  projectTitle: string;
  description: string;
  status: string;
  createdAt: string;
  company: {
    companyName: string;
    email: string;
  };
}

interface DesignerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  profileImage?: string;
  portfolio: PortfolioItem[];
  bio?: string;
  availability: string;
  isApproved: boolean;
  assignedProjects: Project[];
}

export default function DesignerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<DesignerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "projects">("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    image: null as File | null,
    preview: ""
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    skills: [] as string[],
    experienceLevel: "Student",
    bio: "",
    availability: "Available",
  });

  const availableSkills = [
    "Fashion Design", "Textile Design", "Digital Design", "Pattern Making",
    "Garment Construction", "CAD", "Illustration", "Color Theory",
  ];

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await get("/designers/profile");
    if (response.success) {
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        skills: response.data.skills || [],
        experienceLevel: response.data.experienceLevel || "Student",
        bio: response.data.bio || "",
        availability: response.data.availability || "Available",
      });
    } else {
      alert(response.message || "Failed to load profile");
      router.push("/login");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleUpdateProfile = async () => {
    const response = await put("/designers/profile", formData);
    if (response.success) {
      setProfile(response.data);
      setIsEditMode(false);
    } else {
      alert(response.message || "Failed to update profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPortfolioItem(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handlePortfolioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioItem.image) return;

    setIsUploading(true);
    const fd = new FormData();
    fd.append("portfolioImage", newPortfolioItem.image);
    fd.append("title", newPortfolioItem.title);
    fd.append("description", newPortfolioItem.description);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/designers/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: fd
      });
      
      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
        setShowUploadModal(false);
        setNewPortfolioItem({ title: "", description: "", image: null, preview: "" });
      } else {
        alert(result.message || "Failed to upload portfolio item");
      }
    } catch (err) {
      alert("Network error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 gap-8">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-black">Synchronizing Dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Access Denied / Profile Not Found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="fixed top-20 left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-end">
          <div className="flex flex-col gap-6">
            <div className={`w-fit flex items-center gap-3 px-4 py-1.5 border ${
              profile.isApproved 
                ? "border-accent-purple/30 text-accent-purple bg-accent-purple/5" 
                : "border-border text-muted-foreground"
            }`}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                {profile.isApproved ? "Vetted Member" : "Awaiting Approval"}
              </span>
            </div>
            <h1 className="text-6xl font-black text-foreground uppercase tracking-tighter leading-none">Dashboard</h1>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-accent-purple transition-all duration-1000 pb-2 border-b border-transparent hover:border-accent-purple font-black"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="pt-80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-32"
        >
          <div className="flex flex-col md:flex-row gap-20 items-start">
            <div className="relative aspect-square w-56 bg-card overflow-hidden border border-white/5 shadow-sm group">
               {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover grayscale transition-all duration-[1.8s] group-hover:grayscale-0 group-hover:scale-105" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-black text-muted-foreground/20 tracking-[0.5em] uppercase group-hover:text-accent-purple/20 transition-colors duration-1000">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
               )}
               <div className="absolute inset-0 bg-accent-purple/0 group-hover:bg-accent-purple/5 transition-colors duration-1000" />
            </div>
            
            <div className="flex-1 space-y-10">
              <div>
                <h2 className="text-7xl font-black text-foreground uppercase tracking-tighter leading-none mb-6">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-muted-foreground uppercase tracking-[0.4em] text-[10px] font-black">{profile.email}</p>
              </div>
              
              <div className="flex flex-wrap gap-16">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Expertise</p>
                  <p className="text-2xl font-black text-foreground uppercase tracking-tight">{profile.experienceLevel}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                  <p className="text-2xl font-black text-accent-purple uppercase tracking-tight">{profile.availability}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Projects</p>
                  <p className="text-2xl font-black text-foreground uppercase tracking-tight">{profile.assignedProjects?.length || 0} Active</p>
                </div>
              </div>

              {!isEditMode && (
                <button 
                  onClick={() => setIsEditMode(true)}
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground border-b border-white/5 pb-2 hover:border-accent-purple hover:text-accent-purple transition-all duration-1000"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex gap-16 mb-20 border-b border-white/5">
          {[
            { id: "profile", label: "Profile" },
            { id: "portfolio", label: "Portfolio" },
            { id: "projects", label: "Projects" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-1000 relative group ${
                activeTab === tab.id
                  ? "text-accent-purple"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`absolute bottom-0 left-0 h-[1px] bg-accent-purple transition-all duration-1000 ${activeTab === tab.id ? "w-full" : "w-0 group-hover:w-full"}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div key={activeTab}>
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-32">
              <div className="lg:col-span-2 space-y-20">
                {isEditMode ? (
                  <div className="space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-black placeholder:text-muted-foreground/30"
                        />
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-black placeholder:text-muted-foreground/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-[0.2em] font-black resize-none leading-relaxed placeholder:text-muted-foreground/30"
                        placeholder="Define your creative journey..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Experience Level</label>
                        <select
                          value={formData.experienceLevel}
                          onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                          className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer appearance-none"
                        >
                          <option className="bg-background">Student</option>
                          <option className="bg-background">Intern</option>
                          <option className="bg-background">Professional</option>
                        </select>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Availability</label>
                        <select
                          value={formData.availability}
                          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                          className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer appearance-none"
                        >
                          <option className="bg-background">Available</option>
                          <option className="bg-background">Busy</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-12 pt-8">
                      <button 
                        onClick={handleUpdateProfile} 
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-accent border border-accent/30 px-10 py-4 hover:bg-accent hover:text-black transition-all duration-1000"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={() => setIsEditMode(false)}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground border border-white/5 px-10 py-4 hover:bg-muted transition-all duration-1000"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-20">
                    <div className="space-y-10">
                      <h3 className="text-[10px] font-black text-accent-purple uppercase tracking-[0.5em] border-l-2 border-accent-purple/30 pl-4">Bio</h3>
                      <p className="text-muted-foreground leading-relaxed font-black text-3xl">
                        {profile.bio || "No biography provided."}
                      </p>
                    </div>

                    <div className="space-y-10">
                      <h3 className="text-[10px] font-black text-accent-purple uppercase tracking-[0.5em] border-l-2 border-accent-purple/30 pl-4">Skills</h3>
                      <div className="flex flex-wrap gap-x-16 gap-y-8">
                        {profile.skills.length > 0 ? (
                          profile.skills.map(skill => (
                            <div key={skill} className="text-foreground text-[11px] font-black uppercase tracking-[0.3em] border-b border-white/5 pb-3 hover:border-accent-purple transition-all duration-1000">
                              {skill}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm font-black uppercase">No skills listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="space-y-16 border-l border-white/5 pl-16 h-full">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Profile Strength</p>
                    <p className="text-7xl font-black text-foreground tracking-tighter">85<span className="text-2xl text-accent-purple">%</span></p>
                    <div className="w-full h-[1px] bg-white/5 relative">
                       <div className="absolute left-0 top-0 h-[1px] bg-accent-purple w-[85%] shadow-[0_0_10px_rgba(75,0,130,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-20">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Portfolio</h3>
                  <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.5em] mt-6">Work Gallery</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground border-b border-white/5 pb-3 hover:border-accent hover:text-accent transition-all duration-1000"
                >
                  Add Project
                </button>
              </div>
              
              {profile.portfolio.length === 0 ? (
                <div className="py-60 border border-dashed border-white/5 flex flex-col items-center justify-center group hover:bg-card/30 transition-all duration-1000">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-12 font-black">No projects in your portfolio yet.</p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground border border-white/10 px-12 py-5 hover:bg-white hover:text-background transition-all duration-1000"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-32">
                  {profile.portfolio.map((item, idx) => (
                    <motion.div
                      key={item._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] bg-card overflow-hidden mb-10 border border-white/5 shadow-sm">
                        <img 
                          src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                          alt={item.title} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.8s] ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                        <div className="absolute inset-0 bg-accent-purple/0 group-hover:bg-accent-purple/5 transition-colors duration-1000" />
                      </div>
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <h4 className="text-3xl font-black text-foreground uppercase tracking-tight group-hover:text-accent transition-colors duration-1000">{item.title}</h4>
                           <button className="p-2 text-muted-foreground/20 hover:text-red-500 transition-colors duration-1000">
                              <Trash2 size={16} />
                           </button>
                        </div>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed border-l border-white/10 pl-6 group-hover:border-accent transition-all duration-1000">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-20">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Projects</h3>
                  <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.5em] mt-6">Active Missions</p>
                </div>
              </div>
              
              {!profile.assignedProjects || profile.assignedProjects.length === 0 ? (
                <div className="py-60 border border-dashed border-white/5 flex flex-col items-center justify-center">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-4 font-black text-center">No projects assigned yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
                  {profile.assignedProjects.map((project, idx) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="space-y-10 p-12 border border-white/5 bg-card hover:border-accent hover:shadow-2xl transition-all duration-1000 group relative overflow-hidden">
                         <div className="flex justify-between items-start relative z-10">
                           <span className="text-[9px] font-black text-accent-purple uppercase tracking-[0.4em] bg-accent-purple/5 px-3 py-1 border border-accent-purple/10">{project.status}</span>
                           <span className="text-[9px] text-muted-foreground font-mono font-black tracking-widest uppercase opacity-40">#{project._id.slice(-6).toUpperCase()}</span>
                         </div>
                         <div className="relative z-10">
                            <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-tight mb-4 group-hover:text-accent transition-colors duration-1000">
                              {project.projectTitle}
                            </h3>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">{project.company.companyName}</p>
                         </div>
                         <p className="text-[11px] text-muted-foreground leading-relaxed font-black uppercase group-hover:text-foreground transition-colors duration-1000 relative z-10">
                           {project.description}
                         </p>
                         <div className="pt-10 border-t border-white/5 flex justify-between items-center relative z-10">
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Start Date</p>
                               <p className="text-foreground font-black text-xs tracking-widest">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</p>
                            </div>
                            <button className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground border-b border-white/5 pb-2 hover:border-accent hover:text-accent transition-all duration-1000">
                               View Details
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
            onClick={() => setShowUploadModal(false)}
          />
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl bg-background border border-white/5 p-20 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-start mb-24">
              <div>
                <h3 className="text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Add Project</h3>
                <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.5em] mt-6">New Entry</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-muted-foreground hover:text-foreground transition-all duration-1000">
                <X size={28} strokeWidth={1} />
              </button>
            </div>

            <form onSubmit={handlePortfolioUpload} className="space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-20">
                <div className="md:col-span-3 space-y-16">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Title</label>
                    <input
                      type="text"
                      value={newPortfolioItem.title}
                      onChange={(e) => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                      required
                      className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-black placeholder:text-muted-foreground/20"
                      placeholder="PROJECT TITLE"
                    />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Description</label>
                    <textarea
                      value={newPortfolioItem.description}
                      onChange={(e) => setNewPortfolioItem({...newPortfolioItem, description: e.target.value})}
                      required
                      rows={4}
                      className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-[0.2em] font-black resize-none leading-relaxed placeholder:text-muted-foreground/20"
                      placeholder="BRIEF DESCRIPTION..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div 
                    className={`relative aspect-[3/4] bg-card border border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 group ${
                      newPortfolioItem.preview ? "border-accent-purple/30" : "hover:border-accent-purple/20"
                    }`}
                  >
                    {newPortfolioItem.preview ? (
                      <>
                        <img src={newPortfolioItem.preview} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0" />
                        <button 
                          type="button"
                          onClick={() => setNewPortfolioItem({...newPortfolioItem, image: null, preview: ""})}
                          className="absolute top-6 right-6 p-3 bg-background/80 backdrop-blur-md text-foreground hover:bg-red-500 hover:text-white transition-all duration-1000 border border-white/10"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-6 cursor-pointer p-12 text-center group w-full h-full justify-center">
                        <Upload size={32} strokeWidth={1} className="text-muted-foreground/30 group-hover:text-accent-purple transition-all duration-1000" />
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.4em] group-hover:text-foreground transition-all duration-1000">Upload Image</span>
                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" required />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-12 pt-12">
                <button 
                  type="submit" 
                  disabled={isUploading} 
                  className="flex-1 py-8 bg-accent-purple text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-1000 shadow-xl"
                >
                  {isUploading ? "Uploading..." : "Save Entry"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)} 
                  className="flex-1 py-8 border border-white/10 text-foreground text-[10px] font-black uppercase tracking-[0.5em] hover:bg-card transition-all duration-1000"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
