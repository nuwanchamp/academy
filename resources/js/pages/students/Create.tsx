import PageHeading from "@/components/ui/PageHeading.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Check,
    ChevronsUpDown,
    LucideCircleX,
    LucidePlus,
} from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import {cn} from "@/lib/utils.ts";
import {H3} from "@/components/ui/typography/h3.tsx";
import DownloadableMaterial from "@/components/ui/DownloadableMaterial.tsx";

const parents = [
    {
        value: "Parent1",
        label: "Johne Doe",
    },
    {
        value: "parent2",
        label: "Lean lex",
    },
    {
        value: "parent",
        label: "Anusha Pa",
    },

]

export function Create() {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    return (
        <>
            <div className={"text-primary"}>
                <PageHeading lead={"New"} title={"Student Registration"}/>
            </div>
            <div className={"w-full flex gap-4 flex-row justify-between items-start mt-6"}>
                <div className={"w-2/3"}>
                    <Card>
                        <CardContent>
                            <div>
                                <form>
                                    <FieldGroup>
                                        <FieldSet>
                                            <FieldLegend>Student Details</FieldLegend>
                                            <FieldDescription>
                                                Required fields are marked with an asterisk (*)
                                            </FieldDescription>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="student-name">
                                                        Student Name *
                                                    </FieldLabel>
                                                    <Input
                                                        id="student-name"
                                                        placeholder="Evil Rabbit"
                                                        required
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="grade">
                                                        Grade *
                                                    </FieldLabel>
                                                    <Input
                                                        id="grade"
                                                        placeholder=" Grade 4"
                                                        required
                                                    />
                                                </Field>
                                                <FieldLabel htmlFor="student-name">
                                                    Birth Day *
                                                </FieldLabel>
                                                <div className="grid grid-cols-3 -mt-2 gap-4">
                                                    <Field>
                                                        <FieldLabel htmlFor="year">
                                                            Year
                                                        </FieldLabel>
                                                        <Select defaultValue="">
                                                            <SelectTrigger id="year">
                                                                <SelectValue placeholder="YYYY"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="2024">2024</SelectItem>
                                                                <SelectItem value="2025">2025</SelectItem>
                                                                <SelectItem value="2026">2026</SelectItem>
                                                                <SelectItem value="2027">2027</SelectItem>
                                                                <SelectItem value="2028">2028</SelectItem>
                                                                <SelectItem value="2029">2029</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="month">
                                                            Month
                                                        </FieldLabel>
                                                        <Select defaultValue="">
                                                            <SelectTrigger id="month">
                                                                <SelectValue placeholder="MM"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="01">01</SelectItem>
                                                                <SelectItem value="02">02</SelectItem>
                                                                <SelectItem value="03">03</SelectItem>
                                                                <SelectItem value="04">04</SelectItem>
                                                                <SelectItem value="05">05</SelectItem>
                                                                <SelectItem value="06">06</SelectItem>
                                                                <SelectItem value="07">07</SelectItem>
                                                                <SelectItem value="08">08</SelectItem>
                                                                <SelectItem value="09">09</SelectItem>
                                                                <SelectItem value="10">10</SelectItem>
                                                                <SelectItem value="11">11</SelectItem>
                                                                <SelectItem value="12">12</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="day">Day</FieldLabel>
                                                        <Input id="day" placeholder="12" required/>
                                                    </Field>
                                                </div>
                                            </FieldGroup>
                                            <FieldGroup>
                                                <FieldLabel htmlFor="year">
                                                    Diagnose
                                                </FieldLabel>
                                                <div className="grid grid-cols-2  gap-4">

                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            OCD
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            ADHD
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            Downs Syndrome
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            LCD
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            ABCD
                                                        </FieldLabel>
                                                    </Field>
                                                </div>

                                            </FieldGroup>
                                        </FieldSet>
                                        <FieldSeparator/>
                                        <FieldSet>
                                            <FieldLegend>Initial Evaluation</FieldLegend>
                                            <FieldDescription>
                                                Provide the student's initial evaluation based on the parents'
                                                insights.
                                            </FieldDescription>
                                            <FieldGroup>
                                                <div className="grid grid-cols-2  gap-4">

                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            Student can write without a teacher
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            Student can write with guided lines
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            Student can write with guided lines
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            Student can write with guided lines
                                                        </FieldLabel>
                                                    </Field>
                                                    <Field orientation="horizontal">
                                                        <Checkbox
                                                            id="checkout-7j9-same-as-shipping-wgm"
                                                            defaultChecked
                                                        />
                                                        <FieldLabel
                                                            htmlFor="checkout-7j9-same-as-shipping-wgm"
                                                            className="font-normal"
                                                        >
                                                            Student can write with guided lines
                                                        </FieldLabel>
                                                    </Field>
                                                </div>
                                            </FieldGroup>
                                        </FieldSet>
                                        <FieldSet>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="checkout-7j9-optional-comments">
                                                        Parent's Note
                                                    </FieldLabel>
                                                    <Textarea
                                                        id="checkout-7j9-optional-comments"
                                                        placeholder="Add any additional comments"
                                                        className="resize-none"
                                                    />
                                                </Field>
                                            </FieldGroup>
                                        </FieldSet>
                                        <Field orientation="horizontal">
                                            <Button type="submit">Submit</Button>
                                            <Button variant="outline" type="button">
                                                Cancel
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className={"w-1/3 bg-gray-100 flex flex-col gap-4 p-4 rounded-xl"}>
                    <Card>
                        <CardContent>
                            <form>
                                <FieldGroup>
                                    <FieldSet>
                                        <FieldLegend>Parent Details</FieldLegend>
                                        <FieldDescription>
                                            Choose an existing parent or create a new one.
                                        </FieldDescription>
                                        <FieldGroup>
                                            <FieldSet>
                                                <Field>
                                                    <div className={"flex items-center gap-2 flex-row justify-between"}>
                                                        <FieldLabel htmlFor="">
                                                            Parent
                                                        </FieldLabel>

                                                        <Sheet>
                                                            <SheetTrigger asChild>
                                                                <Button variant="ghost"
                                                                        className={"group hover:bg-primary hover:text-white"}>
                                                                    <LucidePlus
                                                                        className={"text-primary group-hover:text-white"}/>
                                                                </Button>
                                                            </SheetTrigger>
                                                            <SheetContent className={"text-primary"}>
                                                                <SheetHeader>
                                                                    <SheetTitle>New Parent</SheetTitle>
                                                                    <SheetDescription>
                                                                        Add a new parent here. Click save when you&apos;re done.
                                                                    </SheetDescription>
                                                                </SheetHeader>
                                                                    <form className={"my-6"}>
                                                                        <FieldGroup>
                                                                            <Field>
                                                                                <FieldLabel htmlFor="parent-name">
                                                                                    Parent Name *
                                                                                </FieldLabel>
                                                                                <Input
                                                                                    id="parent-name"
                                                                                    placeholder="Evil Rabbit"
                                                                                    required
                                                                                />
                                                                            </Field>
                                                                            <Field>
                                                                                <FieldLabel htmlFor="parent-name">
                                                                                    Address *
                                                                                </FieldLabel>
                                                                                <Input
                                                                                    id="parent-name"
                                                                                    placeholder="Evil Rabbit"
                                                                                />
                                                                            </Field>
                                                                            <Field>
                                                                                <FieldLabel htmlFor="parent-name">
                                                                                    Phone *
                                                                                </FieldLabel>
                                                                                <Input
                                                                                    id="parent-name"
                                                                                />
                                                                            </Field>
                                                                            <Field>
                                                                                <FieldLabel htmlFor="parent-name">
                                                                                    Email
                                                                                </FieldLabel>
                                                                                <Input type={"email"} />
                                                                            </Field>
                                                                            <Field>
                                                                                <FieldLabel htmlFor="parent-name">
                                                                                    Password *
                                                                                </FieldLabel>
                                                                                <Input name={"password"} type={"password"}/>
                                                                            </Field>
                                                                        </FieldGroup>
                                                                </form>
                                                                <SheetFooter>
                                                                    <Button type="submit">Save changes</Button>
                                                                    <SheetClose asChild>
                                                                        <Button variant="outline"><LucideCircleX/></Button>
                                                                    </SheetClose>
                                                                </SheetFooter>
                                                            </SheetContent>
                                                        </Sheet>
                                                    </div>
                                                    <Popover open={open} onOpenChange={setOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={open}
                                                                className="w-[200px] justify-between"
                                                            >
                                                                {value
                                                                    ? parents.find((parent) => parent.value === value)?.label
                                                                    : "Select a Parent..."}
                                                                <ChevronsUpDown className="opacity-50"/>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search Parents..."
                                                                              className="h-9"/>
                                                                <CommandList>
                                                                    <CommandEmpty>No parent found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {parents.map((parent) => (
                                                                            <CommandItem
                                                                                key={parent.value}
                                                                                value={parent.label}
                                                                                onSelect={() => {
                                                                                    const nextValue = parent.value === value ? "" : parent.value
                                                                                    setValue(nextValue)
                                                                                    setOpen(false)
                                                                                }}
                                                                            >
                                                                                {parent.label}
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto",
                                                                                        value === parent.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="parent-name">
                                                        Relationship *
                                                    </FieldLabel>
                                                    <Select defaultValue="">
                                                        <SelectTrigger id="parent-name">
                                                            <SelectValue placeholder="Select Relationship"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Father">Father</SelectItem>
                                                            <SelectItem value="Mother">Mother</SelectItem>
                                                            <SelectItem value="Mother">Guardian</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </FieldSet>

                                        </FieldGroup>
                                    </FieldSet>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                    <H3>Documents</H3>
                    <Card>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <DownloadableMaterial name={"Application form"} link={"#"}/>
                                <DownloadableMaterial name={"Evaluation Form"} link={"#"}/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
