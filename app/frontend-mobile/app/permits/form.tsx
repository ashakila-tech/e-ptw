import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import DocumentUpload from "@/components/DocumentUpload";
import DropdownField from "@/components/DropdownField";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import DatePickerField from "@/components/DatePickerField";

export default function ApplicationForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const existingApp = params.application ? JSON.parse(params.application as string) : null;
  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    applicantName,
    setApplicantName,
    permitName,
    setPermitName,
    documentId,
    documentName,
    uploading,
    pickAndUploadDocument,
    permitTypeOpen,
    permitType,
    permitTypeItems,
    setPermitTypeOpen,
    setPermitType,
    setPermitTypeItems,
    locationOpen,
    location,
    locationItems,
    setLocationOpen,
    setLocation,
    setLocationItems,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    submitApplication,
  } = useApplicationForm(existingApp, router);

  useEffect(() => {
    // Check date validity
    if (startTime && endTime) {
      if (endTime <= startTime) {
        setDateError("End time must be after start time.");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }

    // Check overall form validity
    if (!applicantName.trim()) {
      setFormError("Applicant name is required.");
    } else if (!permitName.trim()) {
      setFormError("Permit name is required.");
    } else if (!documentId) {
      setFormError("Please upload a document.");
    } else if (!permitType) {
      setFormError("Please select a permit type.");
    } else if (!location) {
      setFormError("Please select a location.");
    } else if (!startTime || !endTime) {
      setFormError("Please select both start and end times.");
    } else if (dateError) {
      setFormError(dateError);
    } else {
      setFormError(null);
    }
  }, [
    applicantName,
    permitName,
    documentId,
    permitType,
    location,
    startTime,
    endTime,
    dateError,
  ]);

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen
        options={{
          title: existingApp ? "Edit Permit Application" : "New Permit Application",
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
        }}
      />

      {/* Applicant Name */}
      <Text className="text-base text-gray-700 mb-2">Applicant Name</Text>
      <TextInput
        className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 mb-4"
        placeholder="Enter applicant name"
        value={applicantName}
        onChangeText={setApplicantName}
      />

      {/* Permit Name */}
      <Text className="text-base text-gray-700 mb-2">Permit Name</Text>
      <TextInput
        className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 mb-4"
        placeholder="Enter permit name"
        value={permitName}
        onChangeText={setPermitName}
      />

      {/* Permit Type */}
      <Text className="text-base text-gray-700 mb-2">Permit Type</Text>
      <DropdownField
        label="Permit Type"
        open={permitTypeOpen}
        value={permitType}
        items={permitTypeItems}
        setOpen={setPermitTypeOpen}
        setValue={setPermitType}
        setItems={setPermitTypeItems}
        placeholder="Select permit type"
        zIndex={20}
      />

      {/* Location */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Location</Text>
      <DropdownField
        label="Location"
        open={locationOpen}
        value={location}
        items={locationItems}
        setOpen={setLocationOpen}
        setValue={setLocation}
        setItems={setLocationItems}
        placeholder="Select location"
        zIndex={10}
      />

      {/* Start Time */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Start Date and Time</Text>
      <DatePickerField
        value={startTime}
        onChange={setStartTime}
      />

      {/* End Time */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Start Date and Time</Text>
      <DatePickerField
        value={endTime}
        onChange={setEndTime}
      />

      {/* Document Upload */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Document</Text>
      <DocumentUpload
        uploading={uploading}
        documentId={documentId}
        documentName={documentName}
        onPress={pickAndUploadDocument}
      />

      <View className="mt-5"></View>

      {dateError && (
        <Text className="text-red-600 mt-2">{dateError}</Text>
      )}

      {formError && (
        <Text className="text-red-600 mt-2">{formError}</Text>
      )}

      {/* Save as Draft */}
      <Pressable
        onPress={() => submitApplication("DRAFT")}
        disabled={!!formError}
        className={`rounded-2xl py-4 items-center mt-6 ${
          formError ? "bg-gray-400" : "bg-gray-600"
        }`}
      >
        <Text className="text-white font-semibold text-lg">Save as Draft</Text>
      </Pressable>

      {/* Submit */}
      <Pressable
        onPress={() => submitApplication("SUBMITTED")}
        disabled={!!formError}
        className={`rounded-2xl py-4 items-center mt-4 ${
          formError ? "bg-gray-400" : "bg-green-600"
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          Submit Application
        </Text>
      </Pressable>
    </View>
  );
}