import type { Flag } from '../lib/markers';
import type { NavigatorScreenParams } from '@react-navigation/native';

// bottom tabs shown after sign in
export type MainTabParamList = {
  Library: undefined;
  Assistant: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Scan: undefined;
  Insights: undefined;
  Marker: { name: string; value?: string; unit?: string; refRange?: string; flag?: Flag };
  SignIn: undefined;
};


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}