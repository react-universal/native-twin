import { HeaderDocsTop } from "@/feactures/docs/layout/HeaderDocsTop";
import tailwindClasses from "../../../../data";
import { SubTitle } from "@/feactures/docs/components/SubTitle";
import { Text } from "@/feactures/docs/components/Text";
import { Code } from "@/feactures/docs/components/Code";

export default function FlexboxPage() {
  return (
    <div className="flex flex-col gap-5">
      <HeaderDocsTop
        title="Flex"
        Data={tailwindClasses.flexbox.flexProperties}
        id="flexProperties"
      ></HeaderDocsTop>
      <SubTitle>Flex</SubTitle>
      <Text>
        Use flex-initial to allow a flex item to shrink but not grow, taking
        into account its initial size:
      </Text>
      <SubTitle>Flex-1</SubTitle>
      <Text>
        Use flex-1 to allow a flex item to grow and shrink as needed, ignoring
        its initial size:
      </Text>
      <Code
        codeString={`<div className="flex">
  <div className="flex-none w-14 ...">
    01
  </div>
  <div className="flex-1 w-64 ...">
    02
  </div>
  <div className="flex-1 w-32 ...">
    03
  </div>
</div>`}
      ></Code>
      <SubTitle>{`Flex-{cols}`}</SubTitle>
      <Text>
        Use flex-1 to allow a flex item to grow and shrink as needed, ignoring
        its initial size:
      </Text>
      <Code
        codeString={`<div className="flex">
  <div className="flex-none w-14 ...">
    01
  </div>
  <div className="flex-1 w-64 ...">
    02
  </div>
  <div className="flex-1 w-32 ...">
    03
  </div>
</div>`}
      ></Code>

      <SubTitle>{`flex-{direction}`}</SubTitle>
      <Text>
        Use flex-row to position flex items horizontally in the same direction
        as text:
      </Text>
      <Code
        codeString={`<div className="flex flex-row ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <Text>
        Use flex-row-reverse to position flex items horizontally in the opposite
        direction:
      </Text>
      <Code
        codeString={`<div className="flex flex-row-reverse ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <Text>Use flex-col to position flex items vertically:</Text>
      <Code
        codeString={`<div className="flex flex-col ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <Text>
        Use flex-col-reverse to position flex items vertically in the opposite
        direction:
      </Text>
      <Code
        codeString={`<div className="flex flex-col-reverse ...">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>
`}
      ></Code>

      <SubTitle>Flex-wrap</SubTitle>
      <Text>Use flex-wrap to allow flex items to wrap:</Text>
      <Code
        codeString={`<div className="flex flex-wrap">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Flex-nowrap </SubTitle>
      <Text>
        Use flex-nowrap to prevent flex items from wrapping, causing inflexible
        items to overflow the container if necessary:
      </Text>
      <Code
        codeString={`<div className="flex flex-nowrap">
  <div>01</div>
  <div>02</div>
  <div>03</div>
</div>`}
      ></Code>
      <SubTitle>Flex Grow</SubTitle>
      <Text>
        Use grow to allow a flex item to grow to fill any available space:
      </Text>
      <Code
        codeString={`<div className="flex ...">
  <div className="flex-none w-14 h-14 ...">
    01
  </div>
  <div className="grow h-14 ...">
    02
  </div>
  <div className="flex-none w-14 h-14 ...">
    03
  </div>
</div>`}
      ></Code>
      <Text>Use grow-0 to prevent a flex item from growing:</Text>
      <Code
        codeString={`<div className="flex ...">
  <div className="grow h-14 ...">
    01
  </div>
  <div className="grow-0 h-14 ...">
    02
  </div>
  <div className="grow h-14 ...">
    03
  </div>
</div>`}
      ></Code>
      <SubTitle>Setting the flex basis</SubTitle>
      <Text>
        Use the basis-* utilities to set the initial size of flex items.
      </Text>
      <Code
        codeString={`<div className="flex flex-row">
  <div className="basis-1/4">01</div>
  <div className="basis-1/4">02</div>
  <div className="basis-1/2">03</div>
</div>`}
      ></Code>
    </div>
  );
}
