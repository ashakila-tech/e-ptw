import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import DocumentUpload from "@/components/DocumentUpload";
import DropdownField from "@/components/DropdownField";
import DatePickerField from "@/components/DatePickerField";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import LoadingScreen from "@/components/LoadingScreen";
import CustomHeader from "@/components/CustomHeader";

export default function ApplicationForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const existingApp = params.application ? JSON.parse(params.application as string) : null;

  const {
    permitName, setPermitName,
    documentId, documentName, uploading, pickAndUploadDocument, handleDownloadDocument,
    permitTypeOpen, permitType, permitTypeItems, setPermitTypeOpen, setPermitType, setPermitTypeItems,
    locationOpen, location, locationItems, setLocationOpen, setLocation, setLocationItems,
    jobAssignerOpen, jobAssigner, jobAssignerItems, setJobAssignerOpen, setJobAssigner,
    workersOpen, setWorkersOpen, workerIds, setWorkerIds, workerItems,
    safetyEquipmentOpen, setSafetyEquipmentOpen, safetyEquipmentIds, setSafetyEquipmentIds, safetyEquipmentItems,
    startTime, setStartTime, endTime, setEndTime, loading,
    submitApplication,
  } = useApplicationForm(existingApp, router);

  const [formError, setFormError] = useState<string | null>(null);

  // Validation
  useEffect(() => {
    if (!permitName.trim()) setFormError("Permit name is required.");
    else if (!permitType) setFormError("Please select a permit type.");
    else if (!location) setFormError("Please select a location.");
    else if (!startTime || !endTime) setFormError("Please select both start and end times.");
    else if (startTime && endTime && endTime <= startTime) setFormError("End time must be after start time.");
    else if (!documentId) setFormError("Please upload a document.");
    else setFormError(null);
  }, [permitName, permitType, location, startTime, endTime, documentId]);

  if (loading) return <LoadingScreen message="Fetching data..." />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <CustomHeader
        title={existingApp ? "Edit Permit Application" : "New Permit Application"}
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1 p-4">
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
          zIndex={50}
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
          zIndex={40}
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

        {/* Workers */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Workers</Text>
        <DropdownField
          label="Workers"
          open={workersOpen}
          value={workerIds}
          items={workerItems}
          setOpen={setWorkersOpen}
          setValue={setWorkerIds}
          placeholder="Select workers"
          zIndex={20}
          multiple={true}
        />
        {/* Display Selected Workers */}
        <View className="flex-row flex-wrap mt-2">
          {workerIds.map((id) => {
            const worker = workerItems.find((item) => item.value === id);
            if (!worker) return null;
            return (
              <View key={id} className="flex-row items-center bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-blue-800 text-sm">{worker.label}</Text>
                <TouchableOpacity onPress={() => setWorkerIds(currentIds => currentIds.filter(workerId => workerId !== id))} className="ml-2">
                  <Text className="text-blue-800 font-bold text-xs">X</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Safety Equipment */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Safety Equipment</Text>
        <DropdownField
          label="Safety Equipment"
          open={safetyEquipmentOpen}
          value={safetyEquipmentIds}
          items={safetyEquipmentItems}
          setOpen={setSafetyEquipmentOpen}
          setValue={setSafetyEquipmentIds}
          placeholder="Select safety equipment"
          zIndex={10}
          multiple={true}
        />
        {/* Display Selected Safety Equipment */}
        <View className="flex-row flex-wrap mt-2">
          {safetyEquipmentIds.map((id) => {
            const equipment = safetyEquipmentItems.find((item) => item.value === id);
            if (!equipment) return null;
            return (
              <View key={id} className="flex-row items-center bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-blue-800 text-sm">{equipment.label}</Text>
                <TouchableOpacity onPress={() => setSafetyEquipmentIds(currentIds => currentIds.filter(equipmentId => equipmentId !== id))} className="ml-2">
                  <Text className="text-blue-800 font-bold text-xs">X</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Start / End Date */}
        <View style={{ zIndex: 60 }}>
          <Text className="text-base text-gray-700 mt-4 mb-2">Start Date and Time</Text>
          <DatePickerField value={startTime} onChange={setStartTime} />
        </View>

        <View style={{ zIndex: 55 }}>
          <Text className="text-base text-gray-700 mt-4 mb-2">End Date and Time</Text>
          <DatePickerField value={endTime} onChange={setEndTime} />
        </View>

        {/* Document Upload */}
        <Text className="text-base text-gray-700 mt-4 mb-2">Document</Text>
        <DocumentUpload
          uploading={uploading}
          documentId={documentId}
          documentName={documentName}
          onUploadPress={pickAndUploadDocument}
          onDownloadPress={handleDownloadDocument}
        />

        {formError ? <Text className="text-red-600 mt-4">{formError}</Text> : null}

        {/* Action Buttons */}
        <View className="flex-row mt-8 space-x-4">
          <Pressable
            onPress={() => submitApplication("DRAFT")}
            disabled={!!formError}
            className={`flex-[0.4] rounded-xl py-4 mr-3 items-center ${formError ? "bg-gray-400" : "bg-primary"}`}
          >
            <Text className="text-white font-semibold text-base">Save as Draft</Text>
          </Pressable>

          <Pressable
            onPress={() => !formError && submitApplication("SUBMITTED")}
            disabled={!!formError}
            className={`flex-[0.6] rounded-xl py-4 items-center ${formError ? "bg-gray-400" : "bg-bg1"}`}
          >
            <Text className="text-white font-semibold text-base">Submit Application</Text>
          </Pressable>
        </View>
        <View className="p-10" />
      </ScrollView>
    </SafeAreaView>
  );
}