import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@serrale/api";
import { AppButton, LoadingScreen, ProjectCard, colors, spacing } from "@serrale/ui";
import { StyleSheet, View } from "react-native";

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: Boolean(projectId)
  });

  if (projectQuery.isPending) {
    return <LoadingScreen message="Loading project..." />;
  }

  if (!projectQuery.data) {
    return <LoadingScreen message="Project not found." />;
  }

  return (
    <View style={styles.screen}>
      <ProjectCard
        title={projectQuery.data.title}
        description={projectQuery.data.description}
        status={projectQuery.data.status}
      />
      <AppButton
        label="View Project Proposals"
        onPress={() => router.push(`/projects/proposals?projectId=${projectId}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md
  }
});
