"use client";

import React, {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {useAuth} from "../../../contexts/AuthContext";
import {logout, updateUserProfile} from "../../../lib/auth";
import {useRouter} from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";

const ProfilePage = () => {
  const {user, userData, setUserData} = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    interests: [],
    learningGoals: [],
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        bio: userData.profile?.bio || "",
        interests: userData.profile?.interests || [],
        learningGoals: userData.profile?.learningGoals || [],
      });
    }
  }, [userData]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push("/login");
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const updates = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        profile: {
          bio: formData.bio,
          interests: formData.interests,
          learningGoals: formData.learningGoals,
        },
      };

      const result = await updateUserProfile(user.uid, updates);
      if (result.success) {
        setUserData((prev) => ({...prev, ...updates}));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addInterest = () => {
    setFormData((prev) => ({
      ...prev,
      interests: [...prev.interests, ""],
    }));
  };

  const removeInterest = (index) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const updateInterest = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.map((item, i) => (i === index ? value : item)),
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-900 p-4">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-8"
            variants={itemVariants}
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
              <p className="text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
            >
              Sign Out
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="text-center">
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    whileHover={{scale: 1.1}}
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-gray-900">
                        {userData?.firstName?.[0]}
                        {userData?.lastName?.[0]}
                      </span>
                    )}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {userData?.displayName || "User"}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{user?.email}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {userData?.stats?.studySessions || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Study Sessions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {userData?.stats?.topicsStudied || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Topics Studied
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Information */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Profile Information
                  </h3>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </motion.button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Interests
                      </label>
                      {formData.interests.map((interest, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={interest}
                            onChange={(e) =>
                              updateInterest(index, e.target.value)
                            }
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            placeholder="Enter an interest..."
                          />
                          <motion.button
                            onClick={() => removeInterest(index)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                          >
                            ×
                          </motion.button>
                        </div>
                      ))}
                      <motion.button
                        onClick={addInterest}
                        className="w-full py-2 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors"
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
                      >
                        + Add Interest
                      </motion.button>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl disabled:opacity-70"
                      whileHover={!isLoading ? {scale: 1.02} : {}}
                      whileTap={!isLoading ? {scale: 0.98} : {}}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          First Name
                        </label>
                        <p className="text-white">
                          {userData?.firstName || "Not set"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Last Name
                        </label>
                        <p className="text-white">
                          {userData?.lastName || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Bio
                      </label>
                      <p className="text-white">
                        {userData?.profile?.bio || "No bio added yet"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Interests
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {userData?.profile?.interests?.length > 0 ? (
                          userData.profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-400">
                            No interests added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
