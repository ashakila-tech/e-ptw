import PermitCard from '@/components/PermitCard';
import { View, Text, FlatList } from 'react-native';

export default function MyPermitTab() {
  const tempData: PermitData[] = [
    {
      id: 1, name: "Locker Service", status: "Approved", 
      location: "Security Room", document: "Permit_locker.pdf",
      createdTime: "3/9/2025", workStartTime: "3/9/2025"
    },
    {
      id: 2, name: "Sensor Installation", status: "Pending", 
      location: "Meeting Room", document: "Permit_sensor.pdf",
      createdTime: "4/9/2025", workStartTime: "5/9/2025"
    },
    {
      id: 3, name: "PC Installation", status: "Pending", 
      location: "Server Room", document: "Permit_pc_installation.pdf",
      createdTime: "4/9/2025", workStartTime: "5/9/2025"
    },
    {
      id: 4, name: "PC Troubleshoot", status: "Rejected", 
      location: "Server Room", document: "Permit_pc_troubleshoot.pdf",
      createdTime: "5/9/2025", workStartTime: "-"
    },
    {
      id: 5, name: "Locker Installation", status: "Approved", 
      location: "Security Room", document: "Permit_locker_2.pdf",
      createdTime: "6/9/2025", workStartTime: "6/9/2025"
    },
    {
      id: 6, name: "PC Troubleshoot", status: "Pending", 
      location: "Server Room", document: "Permit_pc_troubleshoot.pdf",
      createdTime: "8/9/2025", workStartTime: "-"
    }
  ];

  return (
    // <View className='w-full flex-1 p-4'>
      <FlatList 
        data={tempData}
        renderItem={({item}) => (
          <PermitCard 
            {...item}
          />
        )}
        scrollEnabled={true}
        className='w-full p-3'
      />
    // </View>
  );
}