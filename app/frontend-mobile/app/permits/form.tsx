import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import DocumentUpload from "@/components/DocumentUpload";
import DropdownField from "@/components/DropdownField";
import DatePickerField from "@/components/DatePickerField";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import LoadingScreen from "@/components/LoadingScreen";

export default function ApplicationForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const existingApp = params.application ? JSON.parse(params.application as string) : null;

  const {
    permitName, setPermitName,
    documentId, documentName, uploading, pickAndUploadDocument,
    permitTypeOpen, permitType, permitTypeItems, setPermitTypeOpen, setPermitType, setPermitTypeItems,
    locationOpen, location, locationItems, setLocationOpen, setLocation, setLocationItems,
    jobAssignerOpen, jobAssigner, jobAssignerItems, setJobAssignerOpen, setJobAssigner,
    startTime, setStartTime, endTime, setEndTime,
    submitApplication,
  } = useApplicationForm(existingApp, router);

  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form validation
  useEffect(() => {
    if (startTime && endTime && endTime <= startTime) {
      setDateError("End time must be after start time.");
    } else setDateError(null);

    if (!permitName.trim()) setFormError("Permit name is required.");
    else if (!documentId) setFormError("Please upload a document.");
    else if (!permitType) setFormError("Please select a permit type.");
    else if (!location) setFormError("Please select a location.");
    else if (!startTime || !endTime) setFormError("Please select both start and end times.");
    else if (!jobAssigner) setFormError("Please select a job assigner.");
    else if (dateError) setFormError(dateError);
    else setFormError(null);
  }, [permitName, documentId, permitType, location, startTime, endTime, jobAssigner, dateError]);

  // Determine if dropdown data is still loading
  const loading = permitTypeItems.length === 0 || locationItems.length === 0 || jobAssignerItems.length === 0;

  // Pre-fill dropdowns after items are loaded
  useEffect(() => {
    if (existingApp) {
      if (existingApp.permitTypeId && permitTypeItems.length > 0) {
        setPermitType(Number(existingApp.permitTypeId));
      }
      if (existingApp.locationId && locationItems.length > 0) {
        setLocation(Number(existingApp.locationId));
      }
      if (existingApp.jobAssignerId && jobAssignerItems.length > 0) {
        setJobAssigner(Number(existingApp.jobAssignerId));
      }
    }
  }, [existingApp, permitTypeItems, locationItems, jobAssignerItems]);

  if (loading) {
    return <LoadingScreen message="Fetching data..." />;
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Stack.Screen options={{
        title: existingApp ? "Edit Permit Application" : "New Permit Application",
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      }} />

      {/* Permit Name */}
      <Text className="text-base text-gray-700 mb-2">Permit Name</Text>
      <TextInput
        className="border border-gray-300 rounded-2xl px-4 py-3"
        placeholder="Enter permit name"
        value={permitName}
        onChangeText={setPermitName}
      />

      {/* Permit Type */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Permit Type</Text>
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

      {/* Job Assigner */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Job Assigner</Text>
      <DropdownField
        label="Job Assigner"
        open={jobAssignerOpen}
        value={jobAssigner}
        items={jobAssignerItems}
        setOpen={setJobAssignerOpen}
        setValue={setJobAssigner}
        placeholder="Select job assigner"
        zIndex={30}
      />

      {/* Start / End Date */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Start Date and Time</Text>
      <DatePickerField value={startTime} onChange={setStartTime} />

      <Text className="text-base text-gray-700 mt-4 mb-2">End Date and Time</Text>
      <DatePickerField value={endTime} onChange={setEndTime} />

      {/* Document Upload */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Document</Text>
      <DocumentUpload
        uploading={uploading}
        documentId={documentId}
        documentName={documentName}
        onPress={pickAndUploadDocument}
      />

      <View className="m-10" />

      {dateError && <Text className="text-red-600 mt-2">{dateError}</Text>}
      {formError && <Text className="text-red-600 mt-2">{formError}</Text>}

      {/* Action Buttons */}
      <View className="flex-row mt-8 space-x-4">
        <Pressable
          onPress={() => submitApplication("DRAFT")}
          disabled={!!formError}
          className={`flex-[0.4] rounded-xl py-4 mr-3 items-center ${
            formError ? "bg-gray-400" : "bg-primary"
          }`}
        >
          <Text className="text-white font-semibold text-base">Save as Draft</Text>
        </Pressable>

        <Pressable
          onPress={() => submitApplication("SUBMITTED")}
          disabled={!!formError}
          className={`flex-[0.6] rounded-xl py-4 items-center ${
            formError ? "bg-gray-400" : "bg-approved"
          }`}
        >
          <Text className="text-white font-semibold text-base">Submit Application</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
