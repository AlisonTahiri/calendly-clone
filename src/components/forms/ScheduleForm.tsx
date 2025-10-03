"use client";

import React, { Fragment } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleFormSchema } from "@/schema/schedule";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatTimezoneOffset } from "@/lib/formatters";
import { Loader2, Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { saveSchedule } from "@/server/actions/schedule";

type Availability = {
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
  const [successMessage, setSuccessMessage] = React.useState("");
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities:
        schedule?.availabilities.toSorted((a, b) => {
          return timeToInt(a.startTime) - timeToInt(b.startTime);
        }) ?? [],
    },
    mode: "all",
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    name: "availabilities",
    control: form.control,
  });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field) => ({
      ...field,
    })),
    (availability) => availability.dayOfWeek
  );

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
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
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <p className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-success">{successMessage}</p>
        )}

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" {...field} />
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

        <div className="grid grid-cols-[auto_1fr] gap-y-6 gap-x-4">
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className="capitalize text-sm font-semibold">
                {dayOfWeek.substring(0, 3)}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    addAvailability({
                      startTime: "09:00",
                      endTime: "17:00",
                      dayOfWeek,
                    });
                  }}
                  type="button"
                  variant="outline"
                  className="size-6"
                >
                  <Plus />
                </Button>
                {groupedAvailabilityFields[dayOfWeek]?.map((field, index) => (
                  <div className="flex flex-col gap-1" key={field.id}>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`availabilities.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-24 text-center"
                                aria-label={`${dayOfWeek} Start Time ${
                                  index + 1
                                }`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      -
                      <FormField
                        control={form.control}
                        name={`availabilities.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-24 text-center"
                                aria-label={`${dayOfWeek} End Time ${
                                  index + 1
                                }`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        className="size-5 p-1"
                        variant="destructiveGhost"
                        onClick={() => removeAvailability(index)}
                      >
                        <X />
                      </Button>
                    </div>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(index)
                          ?.message
                      }
                    </FormMessage>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(index)
                          ?.startTime?.message
                      }
                    </FormMessage>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(index)
                          ?.endTime?.message
                      }
                    </FormMessage>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
