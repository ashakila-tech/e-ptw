import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, TouchableOpacity } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useRouter, Stack } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "@env";

export default function ApplicationForm() {
  const router = useRouter();

  // --- Form state ---
  const [applicantName, setApplicantName] = useState("");
  const [permitName, setPermitName] = useState("");
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // --- Permit Type Dropdown ---
  const [permitTypeOpen, setPermitTypeOpen] = useState(false);
  const [permitType, setPermitType] = useState<number | null>(null);
  const [permitTypeItems, setPermitTypeItems] = useState<
    { label: string; value: number }[]
  >([]);

  // --- Location Dropdown ---
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<number | null>(null);
  const [locationItems, setLocationItems] = useState<
    { label: string; value: number }[]
  >([]);

  // --- Fetch dropdown data ---
  useEffect(() => {
    async function fetchData() {
      try {
        const typeRes = await fetch(`${API_BASE_URL}api/permit-types/`);
        const typeData = await typeRes.json();
        setPermitTypeItems(
          typeData.map((t: any) => ({ label: t.name, value: t.id }))
        );

        const locRes = await fetch(`${API_BASE_URL}api/locations/`);
        const locData = await locRes.json();
        setLocationItems(
          locData.map((l: any) => ({ label: l.name, value: l.id }))
        );
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    }

    fetchData();
  }, []);

  // --- Pick + upload document ---
  const pickAndUploadDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

    if (!result.canceled) {
      const file = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);

      try {
        const res = await fetch(`${API_BASE_URL}api/documents/upload`, {
          method: "POST",
          headers: {
            // 👇 DO NOT set Content-Type manually — let fetch handle it
            // because FormData automatically sets the correct boundary
          },
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed (${res.status})`);
        }

        const doc = await res.json();
        setDocumentId(doc.id);
        Alert.alert("Upload Success", `Uploaded: ${doc.filename}`);
      } catch (err: any) {
        console.error("Upload error:", err);
        Alert.alert("Error", err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  // --- Submit application ---
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      const payload = {
        permit_type_id: permitType,
        workflow_data_id: 1, // backend may update this automatically
        location_id: location,
        applicant_id: 1, // TODO: replace with logged-in user id
        name: permitName,
        document_id: documentId, // 👈 use uploaded doc id
        status,
      };

      console.log("Submitting payload:", payload);

      const res = await fetch(`${API_BASE_URL}api/applications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to save application (${res.status})`);
      }

      Alert.alert(
        "Success",
        status === "DRAFT"
          ? "Application saved as draft."
          : "Application submitted successfully."
      );

      router.push("/(tabs)/mypermit");
    } catch (err: any) {
      console.error("Error submitting application:", err);
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen
        options={{
          title: "New Permit Application",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />

      {/* Applicant Name */}
      <View className="mb-4">
        <Text className="text-base text-gray-700 mb-2">Applicant Name</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-900"
          placeholder="Enter applicant name"
          value={applicantName}
          onChangeText={setApplicantName}
        />
      </View>

      {/* Permit Name */}
      <View className="mb-4">
        <Text className="text-base text-gray-700 mb-2">Permit Name</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-900"
          placeholder="Enter permit name"
          value={permitName}
          onChangeText={setPermitName}
        />
      </View>

      {/* Document Upload */}
      <View className="mb-4">
        <Text className="text-base text-gray-700 mb-2">Document</Text>
        <TouchableOpacity
          onPress={pickAndUploadDocument}
          className="bg-blue-600 rounded-2xl py-3 px-4 items-center"
          disabled={uploading}
        >
          <Text className="text-white font-semibold">
            {uploading
              ? "Uploading..."
              : documentId
              ? "Change Document"
              : "Upload Document"}
          </Text>
        </TouchableOpacity>
        {documentId && (
          <Text className="text-green-600 mt-2">Document uploaded ✅</Text>
        )}
      </View>

      {/* Permit Type Dropdown */}
      <View className="mb-4 z-20">
        <Text className="text-base text-gray-700 mb-2">Permit Type</Text>
        <DropDownPicker
          open={permitTypeOpen}
          value={permitType}
          items={permitTypeItems}
          setOpen={setPermitTypeOpen}
          setValue={setPermitType}
          setItems={setPermitTypeItems}
          placeholder="Select permit type"
          listMode="MODAL"
          style={{ borderColor: "#d1d5db", borderRadius: 16 }}
          dropDownContainerStyle={{ borderColor: "#d1d5db", borderRadius: 16 }}
        />
      </View>

      {/* Location Dropdown */}
      <View className="mb-4 z-10">
        <Text className="text-base text-gray-700 mb-2">Location</Text>
        <DropDownPicker
          open={locationOpen}
          value={location}
          items={locationItems}
          setOpen={setLocationOpen}
          setValue={setLocation}
          setItems={setLocationItems}
          placeholder="Select location"
          listMode="MODAL"
          style={{ borderColor: "#d1d5db", borderRadius: 16 }}
          dropDownContainerStyle={{ borderColor: "#d1d5db", borderRadius: 16 }}
        />
      </View>

      {/* Save as Draft Button */}
      <Pressable
        onPress={() => submitApplication("DRAFT")}
        className="bg-gray-600 rounded-2xl py-4 items-center mt-6"
      >
        <Text className="text-white font-semibold text-lg">Save as Draft</Text>
      </Pressable>

      {/* Submit Button */}
      <Pressable
        onPress={() => submitApplication("SUBMITTED")}
        className="bg-green-600 rounded-2xl py-4 items-center mt-4"
      >
        <Text className="text-white font-semibold text-lg">
          Submit Application
        </Text>
      </Pressable>
    </View>
  );
}
