import type { NavigatorScreenParams } from '@react-navigation/native';

// bottom tabs shown after sign in
export type MainTabParamList = {
  Library: undefined;
  Trends: undefined;
  Assistant: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Scan: undefined;
  Insights: undefined;
  Marker: { key: string; name?: string }; // stats page for one marker
  SignIn: undefined;
};


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}