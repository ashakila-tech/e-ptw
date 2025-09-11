import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useRouter, Stack } from "expo-router";
import { API_BASE_URL } from "@env";

export default function ApplicationForm() {
  const router = useRouter();

  // --- Form state ---
  const [applicantName, setApplicantName] = useState("");
  const [permitName, setPermitName] = useState("");
  const [document, setDocument] = useState("");

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
        const typeRes = await fetch(`${API_BASE_URL}api/permit-types`);
        const typeData = await typeRes.json();
        setPermitTypeItems(
          typeData.map((t: any) => ({ label: t.name, value: t.id }))
        );

        const locRes = await fetch(`${API_BASE_URL}api/locations`);
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

  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      const payload = {
        permit_type_id: permitType,
        workflow_data_id: 1, // backend may update this automatically
        location_id: location,
        applicant_id: 1, // TODO: replace with logged-in user id
        name: permitName,
        document_id: 1, // TODO: replace with actual document upload
        status, // "DRAFT" or "SUBMITTED"
      };

      console.log("Submitting payload:", payload);

      const res = await fetch(`${API_BASE_URL}api/applications`, {
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

      {/* Document */}
      <View className="mb-4">
        <Text className="text-base text-gray-700 mb-2">Document</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 text-gray-900"
          placeholder="Enter document (e.g. doc1.pdf)"
          value={document}
          onChangeText={setDocument}
        />
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
