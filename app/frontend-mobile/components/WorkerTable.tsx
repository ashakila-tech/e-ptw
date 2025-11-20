import React from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";

interface WorkerTableProps {
  workers: any[];
  isEditable?: boolean;
  handleDeleteWorker: (worker: any) => void;
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workers, isEditable = false, handleDeleteWorker }) => {
  const router = useRouter();

  return (
    <ScrollView horizontal>
      <View>
        {/* Table Header */}
        <View className="flex-row bg-gray-50 border-b border-gray-200">
          <Text className="p-3 w-16 font-semibold text-primary">#</Text>
          <Text className="p-3 w-40 font-semibold text-primary">Name</Text>
          <Text className="p-3 w-40 font-semibold text-primary">IC/Passport</Text>
          <Text className="p-3 w-32 font-semibold text-primary">Contact</Text>
          <Text className="p-3 w-40 font-semibold text-primary">Position</Text>
          <Text className="p-3 w-32 font-semibold text-primary">Status</Text>
          <Text className="p-3 w-32 font-semibold text-primary">Type</Text>
          <Text className={`p-3 font-semibold text-primary text-center ${isEditable ? 'w-60' : 'w-32'}`}>Actions</Text>
        </View>

        {/* Table Body */}
        {workers.map((worker: any, index: number) => (
          <View key={worker.id} className="flex-row border-b border-gray-200 items-center">
            <Text className="p-3 w-16 text-primary">{index + 1}</Text>
            <Text className="p-3 w-40 text-primary">{worker.name}</Text>
            <Text className="p-3 w-40 text-primary">{worker.ic_passport}</Text>
            <Text className="p-3 w-32 text-primary">{worker.contact}</Text>
            <Text className="p-3 w-40 text-primary">{worker.position}</Text>
            <Text className="p-3 w-32 text-primary capitalize">{worker.employment_status?.replace("-", " ")}</Text>
            <Text className="p-3 w-32 text-primary capitalize">{worker.employment_type?.replace("-", " ")}</Text>
            <View className={`p-3 flex-row justify-center space-x-2 ${isEditable ? 'w-60' : 'w-32'}`}>
              {isEditable && (
                <>
                  <Pressable
                    onPress={() => router.push({ pathname: "/workers/form", params: { worker: JSON.stringify(worker) }})}
                    className="bg-pending px-3 py-1 mx-1 rounded-md"
                  >
                    <Text className="text-primary font-bold">Edit</Text>
                  </Pressable>
                </>
              )}
              <Pressable
                onPress={() => router.push(`/workers/${worker.id}`)}
                className="bg-gray-400 px-3 py-1 mx-1 rounded-md"
              >
                <Text className="text-white font-bold">Details</Text>
              </Pressable>
              {isEditable && (
                <Pressable onPress={() => handleDeleteWorker(worker)} className="bg-rejected px-3 py-1 mx-1 rounded-md">
                  <Text className="text-white font-bold">Delete</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default WorkerTable;