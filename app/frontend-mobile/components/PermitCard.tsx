// components/PermitCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Link } from "expo-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Keep the PermitData type as defined in your project (this file uses Partial)
type PermitCardProps = Partial<PermitData> & {
  onEdit?: () => void;
};

const ICON_COLOR_PRIMARY = "#535252"; // fallback color that matches your theme primary

export default function PermitCard({
  id,
  name,
  status,
  location,
  document,
  permitType,
  createdTime,
  workStartTime,
  workEndTime,
  onEdit,
}: PermitCardProps) {
  const statusKey = (status ?? "").toString().toUpperCase();

  function getStatusClass() {
    switch (statusKey) {
      case "APPROVED":
        return "text-approved font-bold";
      case "PENDING":
      case "SUBMITTED":
        return "text-pending font-bold";
      case "REJECTED":
        return "text-rejected font-bold";
      case "DRAFT":
        return "text-primary font-bold";
      default:
        return "text-primary font-bold";
    }
  }

  return (
    <View className="bg-white rounded-lg w-full p-4 mb-4 shadow-sm">
      {/* Header: status + actions */}
      <View className="flex-row items-center justify-between pb-3">
        <Text className="text-primary text-lg">
          Status: <Text className={getStatusClass()}>{status ?? "-"}</Text>
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

      {/* Row 1: name / location */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2 pr-2">
          <Text className="text-primary">Name:</Text>
          <Text className="text-primary font-bold">{name ?? "-"}</Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-primary">Location:</Text>
          <Text className="text-primary font-bold">{location ?? "-"}</Text>
        </View>
      </View>

      {/* Row 2: work start / work end */}
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

      {/* Row 3: application date / permit type */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2 pr-2">
          <Text className="text-primary">Application Date:</Text>
          <Text className="text-primary font-bold">{formatDate(createdTime)}</Text>
        </View>
        <View className="w-1/2 pl-2">
          <Text className="text-primary">Permit Type:</Text>
          <Text className="text-primary font-bold">{permitType ?? "-"}</Text>
        </View>
      </View>

      {/* Document */}
      <View className="w-full">
        <Text className="text-primary">Document:</Text>
        <Text className="text-primary font-bold">{document ?? "-"}</Text>
      </View>
    </View>
  );
}

/**
 * Accept many possible date forms and return "-" if missing/invalid.
 */
function formatDate(dateValue: string | number | Date | null | undefined): string {
  if (!dateValue) return "-";
  try {
    // dayjs accepts Date | number | string
    const d = dayjs.utc(dateValue as any).tz(dayjs.tz.guess());
    if (!d.isValid()) return "-";
    return d.format("DD-MM-YYYY hh:mm A");
  } catch (e) {
    // be defensive — if dayjs throws for any input, return fallback
    return "-";
  }
}