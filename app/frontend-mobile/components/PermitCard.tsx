// components/PermitCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Link } from "expo-router";
import { formatDate } from "@/utils/date";
import { getStatusClass } from "@/utils/class";

// Keep the PermitData type as defined in your project (this file uses Partial)
type PermitCardProps = Partial<PermitData> & {
  onEdit?: () => void;
};

const ICON_COLOR_PRIMARY = "#535252"; // fallback color that matches theme primary

export default function PermitCard({
  id,
  name,
  createdBy,
  status,
  approvalStatus,
  location,
  permitType,
  createdTime,
  workStartTime,
  workEndTime,
  onEdit,
}: PermitCardProps) {
  const statusKey = (status ?? "").toString().toUpperCase();

  return (
    <View className="bg-white rounded-lg w-full p-4 mb-4 shadow-sm">
      {/* Header: status + actions */}
      <View className="flex-row items-center justify-between pb-3">
        <Text className="text-primary text-lg">
          Status: <Text className={getStatusClass(status)}>{status ?? "-"}</Text>
        </Text>

        <View className="flex-row items-center">
          {statusKey === "DRAFT" && onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="flex-row items-center mr-4"
              accessibilityRole="button"
            >
              <Text className="text-primary mr-2">Edit</Text>
              <IconSymbol name="pencil" size={18} color={ICON_COLOR_PRIMARY} />
            </TouchableOpacity>
          )}

          <Link href={`/permits/${id}`} asChild>
            <TouchableOpacity className="flex-row items-center" accessibilityRole="link">
              <Text className="text-primary mr-2">Details</Text>
              <IconSymbol name="chevron.right" size={20} color={ICON_COLOR_PRIMARY} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="border-b border-gray-200 mb-3" />

      {/* Row 1: permit name / applicant name */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2 pr-2">
          <Text className="text-primary">Permit Name:</Text>
          <Text className="text-primary font-bold">{name ?? "-"}</Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-primary">Applicant Name:</Text>
          <Text className="text-primary font-bold">{createdBy ?? "-"}</Text>
        </View>
      </View>

      {/* Row 2: location / permit type */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2 pr-2">
          <Text className="text-primary">Location:</Text>
          <Text className="text-primary font-bold">{location ?? "-"}</Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-primary">Permit Type:</Text>
          <Text className="text-primary font-bold">{permitType ?? "-"}</Text>
        </View>
      </View>

      {/* Row 3: work start / work end */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2 pr-2">
          <Text className="text-primary">Work Start:</Text>
          <Text className="text-primary font-bold">{formatDate(workStartTime)}</Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-primary">Work End:</Text>
          <Text className="text-primary font-bold">{formatDate(workEndTime)}</Text>
        </View>
      </View>

      {/* Row 4: application date / approval status */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2 pr-2">
          <Text className="text-primary">Application Date:</Text>
          <Text className="text-primary font-bold">{formatDate(createdTime)}</Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-primary">Approval Status:</Text>
          <Text className={getStatusClass(approvalStatus)}>{approvalStatus}</Text>
        </View>
      </View>
    </View>
  );
}