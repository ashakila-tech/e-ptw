import React, { useState } from "react";
import {
  SafeAreaView,
  Image,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import DropdownField from "@/components/DropdownField";
import { useWorkerForm } from "@/hooks/useWorkerForm";

export default function WorkerForm() {
  const router = useRouter();
  const {
    name, setName,
    icPassport, setIcPassport,
    contact, setContact,
    position, setPosition,
    picture,
    pickImage,
    employmentStatus, setEmploymentStatus,
    employmentStatusOpen, setEmploymentStatusOpen,
    employmentStatusItems, setEmploymentStatusItems,
    employmentType, setEmploymentType,
    employmentTypeOpen, setEmploymentTypeOpen,
    employmentTypeItems, setEmploymentTypeItems,
    error,
    loading,
    isEditMode,
    handleSubmit,
  } = useWorkerForm();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title={isEditMode ? "Edit Worker" : "Add New Worker"} onBack={() => router.back()} />

      <ScrollView className="flex-1 p-4">
        {/* Worker Name */}
        <Text className="text-base text-gray-700 mb-2">Worker Name</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3"
          placeholder="Enter worker's full name"
          value={name}
          onChangeText={setName}
        />

        {/* IC/Passport */}
        <Text className="text-base text-gray-700 mt-4 mb-2">IC/Passport</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3"
          placeholder="Enter IC or Passport number"
          value={icPassport}
          onChangeText={setIcPassport}
        />

        {/* Contact */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Contact</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3"
          placeholder="Enter contact number"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        {/* Position */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Position</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3"
          placeholder="Enter worker's position"
          value={position}
          onChangeText={setPosition}
        />

        {/* Employment Status */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Employment Status</Text>
        <DropdownField
          label="Employment Status"
          open={employmentStatusOpen}
          value={employmentStatus}
          items={employmentStatusItems}
          setOpen={setEmploymentStatusOpen}
          setValue={setEmploymentStatus}
          setItems={setEmploymentStatusItems}
          placeholder="Select employment status"
          zIndex={20}
        />

        {/* Employment Type */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Employment Type</Text>
        <DropdownField
          label="Employment Type"
          open={employmentTypeOpen}
          value={employmentType}
          items={employmentTypeItems}
          setOpen={setEmploymentTypeOpen}
          setValue={setEmploymentType}
          setItems={setEmploymentTypeItems}
          placeholder="Select employment type"
          zIndex={10}
        />

        {/* Picture Upload */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Worker Picture</Text>
        <View className="flex-row items-center">
          {picture && (
            <Image
              source={{ uri: picture.uri }}
              className="w-20 h-20 rounded-full mr-4"
            />
          )}
          <TouchableOpacity
            onPress={pickImage}
            className="bg-primary rounded-lg px-4 py-3"
          >
            <Text className="text-white">
              {picture ? "Change Picture" : "Upload Picture"}
            </Text>
          </TouchableOpacity>
        </View>
        {picture && (
          <Text className="text-sm text-gray-500 mt-2 ml-24">{picture.name}</Text>
        )}

        {error && <Text className="text-red-600 mt-4">{error}</Text>}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-4 mt-8 items-center ${loading ? "bg-gray-400" : "bg-bg1"}`}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Worker")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}