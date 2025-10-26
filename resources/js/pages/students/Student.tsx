import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet
} from "@/components/ui/field.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {H3} from "@/components/ui/typography/h3.tsx";
import StudentModuleItem from "@/components/ui/StudentModuleItem.tsx";
import {useState} from "react";
import {cn} from "@/lib/utils.ts";


const logoSrc = new URL("../../../assets/profile-girl.svg", import.meta.url).href;
type FormState = "edit" | "view";

export default function Student() {
    const [fieldState, setFieldState] = useState<FormState>("view")
    let readOnlyStyle  = cn(
        fieldState === "view" && "border-none shadow-none -mt-3 pl-0 h-6",
    )

    return (
        <div className={"flex flex-row gap-4"}>
            <div className={"w-2/3 "}>
                <div className={"flex  flex-col gap-4"}>
                    <Card>
                        <CardContent className={"flex flex-row gap-4 items-start justify-between"}>
                            <div>
                                <PageHeading lead={"Student"} title={"John Doe"}/>
                                <P>John has completed <Badge>72%</Badge> of his path.</P>
                            </div>
                            <div className={"w-40 h-16 relative"}>
                                <img className={"max-w-70 absolute -bottom-12 right-0"} src={logoSrc} alt={"profile"}/>
                            </div>
                        </CardContent>
                    </Card>
                    <div className={"grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"}>
                        <div className={"bg-white rounded-xl border border-gray-200 p-4"}>
                            <P className={"text-sm text-gray-600 mb-1"}>Completion Rate</P>
                            <P className={"text-2xl font-bold text-primary"}>72%</P>
                        </div>
                        <div className={"bg-white rounded-xl border border-gray-200 p-4"}>
                            <P className={"text-sm text-gray-600 mb-1"}>Modules Completed</P>
                            <P className={"text-2xl font-bold text-primary"}>4/5</P>
                        </div>
                        <div className={"bg-white rounded-xl border border-gray-200 p-4"}>
                            <P className={"text-sm text-gray-600 mb-1"}>Average Score</P>
                            <P className={"text-2xl font-bold text-destructive"}>67%</P>
                        </div>
                        <div className={"bg-white rounded-xl border border-gray-200 p-4"}>
                            <P className={"text-sm text-gray-600 mb-1"}>Status</P>
                            <Badge variant={"default"}>
                                Active
                            </Badge>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className={"mt-2"}>
                        <TabsList>
                            <TabsTrigger value="overview">Details</TabsTrigger>
                            <TabsTrigger value="modules">Modules</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <Card>
                                <CardHeader>
                                    <div className={"flex gap-2 justify-between flex-row"}>
                                        <div>
                                            <CardTitle>Information</CardTitle>
                                            <CardDescription>
                                                Make changes to student's information here. Click save when you&apos;re
                                                done.
                                            </CardDescription>
                                        </div>
                                        <Button variant={"ghost"} onClick={()=>setFieldState('edit')}>Change</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <form>
                                        <FieldGroup>
                                            <FieldSet>
                                                <FieldGroup>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Field>
                                                            <FieldLabel htmlFor="student-name">
                                                                Student Name *
                                                            </FieldLabel>
                                                            <Input
                                                                id="student-name"
                                                                placeholder="Evil Rabbit"
                                                                required
                                                                className={readOnlyStyle}
                                                                disabled={fieldState === "view"}
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
                                                                className={readOnlyStyle}
                                                                disabled={fieldState === "view"}
                                                            />
                                                        </Field>
                                                    </div>
                                                    <FieldLabel htmlFor="student-name">
                                                        Birth Day *
                                                    </FieldLabel>
                                                    <div className={"grid grid-cols-3 -mt-2 gap-4 "}>
                                                        <Field>
                                                            <FieldLabel htmlFor="year">
                                                                Year
                                                            </FieldLabel>
                                                            <Select defaultValue="" disabled={fieldState === "view"}>
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
                                                            <Select defaultValue="" disabled={fieldState === "view"}>
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
                                                            <Input id="day" placeholder="12" required
                                                                   disabled={fieldState === "view"}/>
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                    provided initial evaluation based on the parents'
                                                    insights.
                                                </FieldDescription>
                                                <FieldGroup>
                                                    <div className="grid grid-cols-2  gap-4">

                                                        <Field orientation="horizontal">
                                                            <Checkbox
                                                                id="checkout-7j9-same-as-shipping-wgm"
                                                                defaultChecked
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                                                disabled={fieldState === "view"}
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
                                        </FieldGroup>
                                    </form>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save changes</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="modules">
                            <div className="flex w-full flex-col gap-6 mt-6">
                                <StudentModuleItem name={"Number System"} status={"completed"}
                                                   description={"Learn the basics of number system."} id={"1"}/>
                                <StudentModuleItem name={"Phonics Basics"} status={"active"}
                                                   description={"Sound recognition and letter combinations"} id={"2"}/>
                                <StudentModuleItem name={"Life Skills: Daily Routines"} status={"active"}
                                                   description={"Understanding morning and evening routines"} id={"3"}/>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <div className={"w-1/3 bg-gray-100 flex flex-col gap-4 p-4 rounded-xl"}>
                <Card className={"bg-destructive/45 text-white"}>
                    <CardHeader><H3 className={"text-white"}>Parent's Note</H3></CardHeader>
                    <CardContent>
                        <P>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
                            libero nec congue tincidunt, sapien sapien malesuada tortor, eu
                            condimentum tortor ligula eu lectus.
                        </P>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className={"flex gap-2 justify-between flex-row"}>
                            <H3>Parent Information</H3>
                            <Button variant={"ghost"}>Change</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={"grid gap-3"}>
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
                                        <Input type={"email"}/>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="parent-name">
                                            Password *
                                        </FieldLabel>
                                        <Input name={"password"} type={"password"}/>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    )
}
