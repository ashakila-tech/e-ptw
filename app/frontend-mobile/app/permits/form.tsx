import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import DocumentUpload from "@/components/DocumentUpload";
import DropdownField from "@/components/DropdownField";
import DatePickerField from "@/components/DatePickerField";
import { useApplicationForm } from "@/hooks/useApplicationForm";

export default function ApplicationForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const existingApp = params.application ? JSON.parse(params.application as string) : null;

  const {
    applicantName, setApplicantName,
    permitName, setPermitName,
    documentId, documentName, uploading, pickAndUploadDocument,
    permitTypeOpen, permitType, permitTypeItems, setPermitTypeOpen, setPermitType, setPermitTypeItems,
    locationOpen, location, locationItems, setLocationOpen, setLocation, setLocationItems,
    jobAssignerOpen, jobAssigner, jobAssignerItems, setJobAssignerOpen, setJobAssigner, setJobAssignerItems,
    submitApplication,
    startTime, setStartTime, endTime, setEndTime,
  } = useApplicationForm(existingApp, router);

  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (startTime && endTime && endTime <= startTime) {
      setDateError("End time must be after start time.");
    } else setDateError(null);

    if (!applicantName.trim()) setFormError("Applicant name is required.");
    else if (!permitName.trim()) setFormError("Permit name is required.");
    else if (!documentId) setFormError("Please upload a document.");
    else if (!permitType) setFormError("Please select a permit type.");
    else if (!location) setFormError("Please select a location.");
    else if (!startTime || !endTime) setFormError("Please select both start and end times.");
    else if (!jobAssigner) setFormError("Please select a job assigner.");
    else if (dateError) setFormError(dateError);
    else setFormError(null);
  }, [applicantName, permitName, documentId, permitType, location, startTime, endTime, jobAssigner, dateError]);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Stack.Screen options={{
        title: existingApp ? "Edit Permit Application" : "New Permit Application",
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      }} />

      {/* Applicant Name */}
      <Text className="text-base text-gray-700 mb-2">Applicant Name</Text>
      <TextInput className="border border-gray-300 rounded-2xl px-4 py-3 mb-4" placeholder="Enter applicant name"
        value={applicantName} onChangeText={setApplicantName} />

      {/* Permit Name */}
      <Text className="text-base text-gray-700 mb-2">Permit Name</Text>
      <TextInput className="border border-gray-300 rounded-2xl px-4 py-3 mb-4" placeholder="Enter permit name"
        value={permitName} onChangeText={setPermitName} />

      {/* Permit Type */}
      <DropdownField
        label="Permit Type" open={permitTypeOpen} value={permitType} items={permitTypeItems}
        setOpen={setPermitTypeOpen} setValue={setPermitType} setItems={setPermitTypeItems} placeholder="Select permit type" zIndex={20} />

      {/* Location */}
      <DropdownField
        label="Location" open={locationOpen} value={location} items={locationItems}
        setOpen={setLocationOpen} setValue={setLocation} setItems={setLocationItems} placeholder="Select location" zIndex={10} />

      {/* Job Assigner */}
      <DropdownField
        label="Job Assigner" open={jobAssignerOpen} value={jobAssigner} items={jobAssignerItems}
        setOpen={setJobAssignerOpen} setValue={setJobAssigner} setItems={setJobAssignerItems} placeholder="Select job assigner" zIndex={30} />

      {/* Start / End */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Start Date and Time</Text>
      <DatePickerField value={startTime} onChange={setStartTime} />

      <Text className="text-base text-gray-700 mt-4 mb-2">End Date and Time</Text>
      <DatePickerField value={endTime} onChange={setEndTime} />

      {/* Document Upload */}
      <Text className="text-base text-gray-700 mt-4 mb-2">Document</Text>
      <DocumentUpload uploading={uploading} documentId={documentId} documentName={documentName} onPress={pickAndUploadDocument} />

      {dateError && <Text className="text-red-600 mt-2">{dateError}</Text>}
      {formError && <Text className="text-red-600 mt-2">{formError}</Text>}

      {/* Save as Draft */}
      <Pressable onPress={() => submitApplication("DRAFT")} disabled={!!formError}
        className={`rounded-2xl py-4 items-center mt-6 ${formError ? "bg-gray-400" : "bg-gray-600"}`}>
        <Text className="text-white font-semibold text-lg">Save as Draft</Text>
      </Pressable>

      {/* Submit */}
      <Pressable onPress={() => submitApplication("SUBMITTED")} disabled={!!formError}
        className={`rounded-2xl py-4 items-center mt-4 ${formError ? "bg-gray-400" : "bg-green-600"}`}>
        <Text className="text-white font-semibold text-lg">Submit Application</Text>
      </Pressable>
    </ScrollView>
  );
}