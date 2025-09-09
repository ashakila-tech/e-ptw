import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

const PermitCard = ({ id, name, status, location, document, createdTime, workStartTime}
  : PermitData) => {

  return (
    <View className='bg-white rounded-lg w-full p-4 mb-4'>
      <View className='flex-row items-center justify-between pb-3'>
        <Text className='text-primary text-lg'> 
          Status:{' '}
          <Text className={
            status === "Approved"
            ? "text-green-600 font-bold"
            : status === "Pending"
              ? "text-yellow-600 font-bold"
              : status === "Rejected" 
                ? "text-red-600 font-bold"
                : "text-black font-bold"
          }> 
            {status}
          </Text>
        </Text>

        <TouchableOpacity
          className='flex-row items-center'
          onPress={() => console.log("details")}
        >
          <Text className='text-sm'>Details</Text>
          <IconSymbol size={28} name="chevron.right" color={"#000"}/>
        </TouchableOpacity>
      </View>

      <View className="border-b border-gray-300 mb-3" />

      <View className="w-full flex-row mb-2">
        <View className="w-1/2">
          <Text className="text-primary"> Name: </Text>
          <Text className="text-primary font-bold"> {name} </Text>
        </View>

        <View className="w-1/2">
          <Text className="text-primary"> Location: </Text>
          <Text className="text-primary font-bold"> {location} </Text>
        </View>
      </View>

      <View className='w-full flex-row mb-2'>
        <View className="w-1/2">
          <Text className="text-primary"> Application Date: </Text>
          <Text className="text-primary font-bold"> {createdTime} </Text>
        </View>

        <View className="w-1/2">
          <Text className="text-primary"> Work Start Date: </Text>
          <Text className="text-primary font-bold"> {workStartTime} </Text>
        </View>
      </View>
    </View>
  );
}

export default PermitCard;