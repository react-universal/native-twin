import { HeaderDocsTop } from "@/feactures/docs/layout/HeaderDocsTop";
import tailwindClasses from "../../../../data";
import { SubTitle } from "@/feactures/docs/components/SubTitle";
import { Text } from "@/feactures/docs/components/Text";
import { Code } from "@/feactures/docs/components/Code";
import { ClassToRenderer } from "@/feactures/docs/layout/ClassToRederer";
import {
  alignContent,
  alignItems,
  alignSelf,
  justifyItems,
  justifySelf,
  position,
  positionLaterals,
} from "./dataAlignment";

export default function AlignmentPosition() {
  return (
    <div className="flex flex-col gap-5">
      <HeaderDocsTop
        title="Alignment"
        id="alignment"
        Data={tailwindClasses.alignmentPositioning.alignment}
      ></HeaderDocsTop>
      <SubTitle>Align-baseline </SubTitle>
      <Text>
        {`Use items-baseline to align items along the container’s cross axis such
        that all of their baselines align: 01`}
      </Text>
      <Code
        codeString={`<div class="flex items-baseline ...">
  <div class="pt-2 pb-6">01</div>
  <div class="pt-8 pb-12">02</div>
  <div class="pt-12 pb-4">03</div>
</div>`}
      ></Code>
      <SubTitle>Align-top </SubTitle>
      <Text>
        Use align-top to align the top of an element and its descendants with
        the top of the entire line.
      </Text>
      <Code
        codeString={`<span class="inline-block align-top ...">...</span>`}
      ></Code>
      <SubTitle>Align middle </SubTitle>
      <Text>
        Use align-middle to align the middle of an element with the baseline
        plus half the x-height of the parent.
      </Text>
      <Code
        codeString={`<span class="inline-block align-middle ...">...</span>`}
      ></Code>
      <SubTitle>Align bottom </SubTitle>
      <Text>
        Use align-bottom to align the bottom of an element and its descendants
        with the bottom of the entire line.
      </Text>
      <Code
        codeString={`<span class="inline-block align-bottom ...">...</span>`}
      ></Code>
      <SubTitle>Align text top </SubTitle>
      <Text>
        Use align-text-top to align the top of an element with the top of the
        parent element’s font.
      </Text>
      <Code
        codeString={`<span class="inline-block align-text-top ...">...</span>`}
      ></Code>
      <SubTitle>Align text bottom</SubTitle>
      <Text>
        Use align-text-bottom to align the bottom of an element with the bottom
        of the parent element’s font.
      </Text>
      <Code
        codeString={`<span class="inline-block align-text-bottom ...">...</span>`}
      ></Code>
      <SubTitle> Justify Content ({`justify-{alignment}	`})</SubTitle>
      <Text>
        Utilities for controlling how flex and grid items are positioned along a
        container's main axis.
      </Text>
      <SubTitle>Start </SubTitle>
      <Text>
        Use justify-start to justify items against the start of the container’s
        main axis:
      </Text>
      <Code
        codeString={`<div class="flex justify-start ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Center</SubTitle>
      <Text>
        Use justify-center to justify items along the center of the container’s
        main axis:
      </Text>
      <Code
        codeString={`<div class="flex justify-center ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
​
`}
      ></Code>
      <SubTitle>End </SubTitle>
      <Text>
        Use justify-end to justify items against the end of the container’s main
        axis:
      </Text>
      <Code
        codeString={`<div class="flex justify-end ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Space between </SubTitle>
      <Text>
        Use justify-between to justify items along the container’s main axis
        such that there is an equal amount of space between each item:
      </Text>
      <Code
        codeString={`<div class="flex justify-between ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Space around </SubTitle>
      <Text>
        Use justify-around to justify items along the container’s main axis such
        that there is an equal amount of space on each side of each item:
      </Text>
      <Code
        codeString={`<div class="flex justify-around ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Space evenly </SubTitle>
      <Text>
        Use justify-evenly to justify items along the container’s main axis such
        that there is an equal amount of space around each item, but also
        accounting for the doubling of space you would normally see between each
        item when using justify-around:
      </Text>
      <Code
        codeString={`<div class="flex justify-evenly ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Stretch </SubTitle>
      <Text>
        Use justify-stretch to allow content items to fill the available space
        along the container’s main axis:
      </Text>
      <Code
        codeString={`<div class="grid grid-flow-col justify-stretch ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <ClassToRenderer list={justifyItems}></ClassToRenderer>
      <ClassToRenderer list={justifySelf}></ClassToRenderer>

      <ClassToRenderer list={alignItems}></ClassToRenderer>
      <ClassToRenderer list={alignSelf}></ClassToRenderer>
      <ClassToRenderer list={alignContent}></ClassToRenderer>
      <HeaderDocsTop
        title="Positioning"
        id="positioning"
        Data={tailwindClasses.alignmentPositioning.positioning}
      ></HeaderDocsTop>
      <ClassToRenderer list={position}></ClassToRenderer>
      <ClassToRenderer list={positionLaterals}></ClassToRenderer>
    </div>
  );
}
