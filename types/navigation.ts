import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Cart: undefined;
  Scanner: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
