"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { formatTimezoneOffset } from "@/lib/formatters";
import { scheduleFormSchema, ScheduleFormValues } from "@/schema/schedule";
import { saveSchedule } from "@/server/actions/schedule";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { AvailabilityFields } from "./AvailabilityFIelds";

export type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

export default function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const [successMessage, setSuccessMessage] = useState("");

  const groupedAvailabilityFields = Object.groupBy(
    schedule?.availabilities || [],
    (availability) => availability.dayOfWeek
  );

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: DAYS_OF_WEEK_IN_ORDER.map((day) => ({
        dayOfWeek: day,
        timeSlots: groupedAvailabilityFields[day]?.map((availability) => ({
          startTime: availability.startTime,
          endTime: availability.endTime,
        })),
      })),
    },
    mode: "onChange",
  });

  const { control, handleSubmit, formState } = form;

  const onSubmit = async (values: ScheduleFormValues) => {
    setSuccessMessage("");
    const data = await saveSchedule(values);
    if (data?.error) {
      form.setError("root", {
        message: "There was an error while saving your schedule.",
      });
      setSuccessMessage("");
    } else {
      setSuccessMessage("Schedule saved successfully!");
    }
  };

  const { fields: availabilitiesFields } = useFieldArray({
    control,
    name: "availabilities",
  });

  return (
    <div className="container flex flex-col gap-2">
      <h1 className="text-2xl font-semibold mb-2">Set Your Availability</h1>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {form.formState.errors.root && (
            <p className="text-destructive text-sm">
              {form.formState.errors.root.message}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-success">{successMessage}</p>
          )}

          <FormField
            control={control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Intl.supportedValuesOf("timeZone").map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                        {` (${formatTimezoneOffset(timezone)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availabilitiesFields.map((day, dayIndex) => (
              <div key={day.id} className="p-4 border rounded-md sm:max-w-md">
                <h3 className="font-medium capitalize mb-2">{day.dayOfWeek}</h3>
                <AvailabilityFields
                  errors={formState.errors}
                  dayIndex={dayIndex}
                />
              </div>
            ))}
          </div>

          <Button disabled={form.formState.isSubmitting} type="submit">
            Save Schedule
            {form.formState.isSubmitting && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
