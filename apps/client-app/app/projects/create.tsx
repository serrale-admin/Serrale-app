import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createProject } from "@serrale/api";
import { AppButton, AppInput, colors, spacing, typography } from "@serrale/ui";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Add a little more detail"),
  category_id: z.string().min(2, "Category is required"),
  budget: z.string().optional()
});

type ProjectValues = z.infer<typeof projectSchema>;

export default function PostProjectScreen() {
  const router = useRouter();
  const { control, handleSubmit } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      budget: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: async (values: ProjectValues) =>
      createProject({
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        budget: values.budget ? Number(values.budget) : undefined
      }),
    onSuccess: (project) => router.replace(`/projects/${project.id}`)
  });

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Post Project</Text>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <AppInput
            label="Project title"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <AppInput
            label="Project description"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            multiline
            numberOfLines={4}
          />
        )}
      />
      <Controller
        control={control}
        name="category_id"
        render={({ field, fieldState }) => (
          <AppInput
            label="Category"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="budget"
        render={({ field, fieldState }) => (
          <AppInput
            label="Budget (optional)"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <AppButton
        label={createMutation.isPending ? "Posting..." : "Post Project"}
        onPress={handleSubmit((values) => createMutation.mutate(values))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    ...typography.h2,
    color: colors.primaryDark,
    marginBottom: spacing.sm
  }
});
