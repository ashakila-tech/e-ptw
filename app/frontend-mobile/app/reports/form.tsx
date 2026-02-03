import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import DropdownField from "@/components/DropdownField";
import DatePickerField from "@/components/DatePickerField";
import DocumentUpload from "@/components/DocumentUpload";
import { useReportForm } from "@/hooks/useReportForm";

export default function NearMissReportForm() {
  const router = useRouter();
  const {
    name, setName,
    locationId, setLocationId,
    departmentId, setDepartmentId,
    incidentTimestamp, setIncidentTimestamp,
    description, setDescription,
    condition, setCondition,
    concern, setConcern,
    immediateAction, setImmediateAction,
    documentId,
    documentName,
    uploading,
    loading,
    locationOpen, setLocationOpen,
    departmentOpen, setDepartmentOpen,
    conditionOpen, setConditionOpen,
    concernOpen, setConcernOpen,
    locationItems, setLocationItems,
    departmentItems, setDepartmentItems,
    conditionItems, setConditionItems,
    concernItems, setConcernItems,
    submitReport,
    pickAndUploadDocument,
    handleDownloadDocument,
  } = useReportForm(router);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Near Miss Report" onBack={() => router.back()} />
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-base text-gray-700 mb-2">Title / Subject</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="e.g., Slippery floor near entrance"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-base text-gray-700 mb-2">Location of Incident</Text>
        <DropdownField
          open={locationOpen}
          value={locationId}
          items={locationItems}
          setOpen={setLocationOpen}
          setValue={setLocationId}
          setItems={setLocationItems}
          placeholder="Select a location..."
          zIndex={1000}
        />

        <Text className="text-base text-gray-700 mt-4 mb-2">Department</Text>
        <DropdownField
          open={departmentOpen}
          value={departmentId}
          items={departmentItems}
          setOpen={setDepartmentOpen}
          setValue={setDepartmentId}
          setItems={setDepartmentItems}
          placeholder="Select a department (optional)..."
          zIndex={900}
        />

        <Text className="text-base text-gray-700 mt-4 mb-2">Date & Time of Incident</Text>
        <DatePickerField
          value={incidentTimestamp}
          onChange={(date) => date && setIncidentTimestamp(date)}
          mode="datetime"
        />

        <Text className="text-base text-gray-700 mt-4 mb-2">Condition</Text>
        <DropdownField
          open={conditionOpen}
          value={condition}
          items={conditionItems}
          setOpen={setConditionOpen}
          setValue={setCondition}
          setItems={setConditionItems}
          placeholder="Select a condition..."
          zIndex={800}
        />

        <Text className="text-base text-gray-700 mt-4 mb-2">Type of Concern</Text>
        <DropdownField
          open={concernOpen}
          value={concern}
          items={concernItems}
          setOpen={setConcernOpen}
          setValue={setConcern}
          setItems={setConcernItems}
          placeholder="Select a concern..."
          zIndex={700}
        />

        <Text className="text-base text-gray-700 mt-4 mb-2">
          Describe the potential incident / hazard / concern and possible outcome (in as much detail as possible)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 h-40 mb-4"
          placeholder="Describe what happened, what the risks were..."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text className="text-base text-gray-700 mb-2">
          Your immediate actions to resolve the near miss or any recommendations
        </Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 h-40 mb-4"
          placeholder="Describe any immediate corrective actions."
          value={immediateAction}
          onChangeText={setImmediateAction}
          multiline
          textAlignVertical="top"
        />

        <Text className="text-base text-gray-700 mt-4 mb-2">Attachment</Text>
        <View className="mb-8">
          <DocumentUpload
            uploading={uploading}
            documentId={documentId}
            documentName={documentName}
            onUploadPress={pickAndUploadDocument}
            onDownloadPress={handleDownloadDocument}
          />
        </View>

        <Pressable
          onPress={submitReport}
          disabled={loading}
          className={`rounded-xl py-4 mt-4 items-center ${loading ? "bg-gray-400" : "bg-bg1"}`}
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Submit Report</Text>
          )}
        </Pressable>

        <View className="p-10" />
      </ScrollView>
    </SafeAreaView>
  );
}