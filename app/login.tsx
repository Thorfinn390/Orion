import { LinearGradient } from 'expo-linear-gradient';
import { Text, View ,Dimensions} from 'react-native';
const { width } = Dimensions.get('window');
const boxWidth = width - 70; // 35px on each side
const boxHeight = boxWidth + 40;
export default function LoginPage() {
  return (
    <LinearGradient
      // Colors can be hex or tailwind-mapped strings if configured
      colors={["#142850",'#27496D', '#0C7B93',"#00A8CC"]}
      start={{ x: 0, y: 0 }}
      // Bottom-right corner creates the 45-degree slant
      end={{ x: 1, y: 1 }} 
      className="flex-1 items-center justify-center"
    >
      <View 
        style={{ width: boxWidth, height: boxHeight }}
        className="bg-white rounded-[30px] shadow-2xl items-center justify-center p-6"
      >
        <Text className="text-slate-900 text-xl font-bold">
          PlaceHolder, im making login(omar), if you wanna see the home page then remove the redirect line from index.tsx
        </Text>
        {/* You can drop your inputs here later */}
      </View>
    </LinearGradient>
  );
}