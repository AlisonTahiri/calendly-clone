"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScheduleFormValues } from "@/schema/schedule";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Fragment } from "react";
import { FieldErrors, useFieldArray, useFormContext } from "react-hook-form";

interface AvailabilityFieldsProps {
  dayIndex: number;
  errors: FieldErrors<ScheduleFormValues>;
}

export function AvailabilityFields({
  dayIndex,
  errors,
}: AvailabilityFieldsProps) {
  const { control } = useFormContext<ScheduleFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `availabilities.${dayIndex}.timeSlots`,
  });

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      {fields.map((field, slotIndex) => {
        let errorMessage = "";
        if (errors?.availabilities) {
          errorMessage =
            errors?.availabilities[dayIndex]?.timeSlots?.[slotIndex]?.message ||
            "";
        }

        return (
          <Fragment key={field.id}>
            <FormMessage>{errorMessage}</FormMessage>
            <div className="flex  md:flex-row gap-2 items-center  rounded p-1">
              <FormField
                control={control}
                name={`availabilities.${dayIndex}.timeSlots.${slotIndex}.startTime`}
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel className={slotIndex > 0 ? "sr-only" : ""}>
                      Start Time
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`availabilities.${dayIndex}.timeSlots.${slotIndex}.endTime`}
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel className={slotIndex > 0 ? "sr-only" : ""}>
                      End Time
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="destructiveGhost"
                size="sm"
                className="w-8 h-8 self-end"
                onClick={() => remove(slotIndex)}
              >
                <MinusCircleIcon className="h-4 w-4" />
              </Button>
            </div>
          </Fragment>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ startTime: "09:00", endTime: "17:00" })}
        className="w-fit"
      >
        <PlusCircleIcon className="mr-2" /> Add Time Slot
      </Button>
    </div>
  );
}
