// @ts-noCheck
import { useState } from 'react';
import { Text, Image, Pressable, View, PressableProps } from 'react-native';
import { VariantProps, createVariants } from '@native-twin/styled';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

const ChildProp = () => {
    return (
        <View className='bg-black last:text-lg' _twinOrd={0} _twinComponentID="a-660560371" _twinComponentTemplateEntries={
            []
        } _twinComponentSheet={
            require('@native-twin/jsx').StyleSheet.registerComponent("a-660560371", [{
                templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("bg-black"), globalStyles.get("last:text-lg"),].filter(Boolean), rawSheet: {
                    base: [{
                        className: "bg-black",
                        declarations: [{
                            prop: "backgroundColor",
                            value: "rgba(0,0,0,1)",
                            _tag: "COMPILED"
                        }
                        ],
                        selectors: [],
                        precedence: 805306368,
                        important: false,
                        animations: []
                    }
                    ],
                    dark: [],
                    pointer: [],
                    group: [],
                    even: [],
                    first: [],
                    last: [],
                    odd: []
                }
                ,
            }
            ])
        }>
            <Text className='text-blue' _twinOrd={0} _twinComponentID="a:a-1160712654" _twinComponentTemplateEntries={
                []
            } _twinComponentSheet={
                require('@native-twin/jsx').StyleSheet.registerComponent("a:a-1160712654", [{
                    templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("text-blue"),].filter(Boolean), rawSheet: {
                        base: [{
                            className: "text-blue",
                            declarations: [{
                                prop: "color",
                                value: "rgba(96,165,250,1)",
                                _tag: "COMPILED"
                            }
                            ],
                            selectors: [],
                            precedence: 805306368,
                            important: false,
                            animations: []
                        }
                            , {
                            className: "first:bg-purple-600",
                            declarations: [{
                                prop: "backgroundColor",
                                value: "rgba(147,51,234,1)",
                                _tag: "COMPILED"
                            }
                            ],
                            selectors: ["first", "&:first"],
                            precedence: 805437440,
                            important: false,
                            animations: []
                        }
                        ],
                        dark: [],
                        pointer: [],
                        group: [],
                        even: [],
                        first: [],
                        last: [],
                        odd: []
                    }
                    ,
                }
                ])
            }>Text1</Text>
            <Text className='text-red' _twinOrd={1} _twinComponentID="a:b-1154500572" _twinComponentTemplateEntries={
                []
            } _twinComponentSheet={
                require('@native-twin/jsx').StyleSheet.registerComponent("a:b-1154500572", [{
                    templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("text-red"),].filter(Boolean), rawSheet: {
                        base: [{
                            className: "text-red",
                            declarations: [{
                                prop: "color",
                                value: "rgba(248,113,113,1)",
                                _tag: "COMPILED"
                            }
                            ],
                            selectors: [],
                            precedence: 805306368,
                            important: false,
                            animations: []
                        }
                        ],
                        dark: [],
                        pointer: [],
                        group: [],
                        even: [],
                        first: [],
                        last: [],
                        odd: []
                    }
                    ,
                }
                ])
            }>Text2</Text>
        </View>
    )
}

const buttonVariants = createVariants({
    base: 'py-5 m-1 rounded-md items-center justify-center',
    variants: {
        variant: {
            primary: 'bg-blue-200',
            secondary: 'bg-white',
        },
        size: {
            large: 'w-40',
            small: 'w-4',
        },
        isDisable: {
            true: 'opacity-30',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'primary',
    },
});
type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ButtonProps = ButtonVariantProps & PressableProps;

const Button = (props: ButtonProps) => {
    return (
        <Pressable className={buttonVariants(props)} _twinOrd={0} _twinComponentID="b-660560470" _twinComponentTemplateEntries={
            [{
                id: "b-660560470",
                target: "style",
                prop: "className",
                entries: require('@native-twin/core').tw(`${buttonVariants(props)}`),
                templateLiteral: `${buttonVariants(props)}`,
            }
            ]
        } _twinComponentSheet={
            require('@native-twin/jsx').StyleSheet.registerComponent("b-660560470", [{
                templateLiteral: null, prop: "className", target: "style", entries: [].filter(Boolean), rawSheet: {
                    base: [],
                    dark: [],
                    pointer: [],
                    group: [],
                    even: [],
                    first: [],
                    last: [],
                    odd: []
                }
                ,
            }
            ])
        }>
            <Text _twinOrd={0} _twinComponentID="b:a-1160712555" _twinComponentTemplateEntries={
                []
            } _twinComponentSheet={
                require('@native-twin/jsx').StyleSheet.registerComponent("b:a-1160712555",)
            }>asd</Text>
        </Pressable>
    );
};

function HomeScreen() {
    const [active, setActive] = useState(true);
    return (
        <View className='flex-1 -translate-x-2 w-[10vw]' _twinOrd={0} _twinComponentID="c-660560281" _twinComponentTemplateEntries={
            []
        } _twinComponentSheet={
            require('@native-twin/jsx').StyleSheet.registerComponent("c-660560281", [{
                templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("flex-1"), globalStyles.get("-translate-x-2"), globalStyles.get("w-[10vw]"),].filter(Boolean), rawSheet: {
                    base: [{
                        className: "flex-1",
                        declarations: [{
                            prop: "flex",
                            value: {
                                flexGrow: 1,
                                flexShrink: 1,
                                flexBasis: "0%"
                            }
                            ,
                            _tag: "COMPILED"
                        }
                        ],
                        selectors: [],
                        precedence: 805306368,
                        important: false,
                        animations: []
                    }
                        , {
                        className: "-translate-x-2",
                        declarations: [{
                            prop: "transform",
                            value: [{
                                prop: "translateX",
                                value: -8,
                                _tag: "COMPILED"
                            }
                            ],
                            _tag: "COMPILED"
                        }
                        ],
                        selectors: [],
                        precedence: 805306368,
                        important: false,
                        animations: []
                    }
                        , {
                        className: "w-[10vw]",
                        declarations: [{
                            prop: "width",
                            value: "10vw",
                            _tag: "NOT_COMPILED"
                        }
                        ],
                        selectors: [],
                        precedence: 805306368,
                        important: false,
                        animations: []
                    }
                    ],
                    dark: [],
                    pointer: [],
                    group: [],
                    even: [],
                    first: [],
                    last: [],
                    odd: []
                }
                ,
            }
            ])
        }>
            <View
                className={`
          flex-1
          bg-red-500
          first:bg-purple-600
        `}
                debug _twinOrd={0} _twinComponentID="c:a-1160712488" _twinComponentTemplateEntries={
                    []
                } _twinComponentSheet={
                    require('@native-twin/jsx').StyleSheet.registerComponent("c:a-1160712488", [{
                        templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("flex-1"), globalStyles.get("bg-red-500"), globalStyles.get("first:bg-purple-600"),].filter(Boolean), rawSheet: {
                            base: [{
                                className: "flex-1",
                                declarations: [{
                                    prop: "flex",
                                    value: {
                                        flexGrow: 1,
                                        flexShrink: 1,
                                        flexBasis: "0%"
                                    }
                                    ,
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: false,
                                animations: []
                            }
                                , {
                                className: "bg-red-500",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(239,68,68,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: false,
                                animations: []
                            }
                                , {
                                className: "first:bg-purple-600",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(147,51,234,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: ["first", "&:first"],
                                precedence: 805437440,
                                important: false,
                                animations: []
                            }
                            ],
                            dark: [],
                            pointer: [],
                            group: [],
                            even: [],
                            first: [],
                            last: [],
                            odd: []
                        }
                        ,
                    }
                    ])
                }
            >
                <View className='p-2 !bg-green-800' _twinOrd={0} _twinComponentID="c:a:a-89096857" _twinComponentTemplateEntries={
                    []
                } _twinComponentSheet={
                    require('@native-twin/jsx').StyleSheet.registerComponent("c:a:a-89096857", [{
                        templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("p-2"), globalStyles.get("!bg-green-800"),].filter(Boolean), rawSheet: {
                            base: [{
                                className: "p-2",
                                declarations: [{
                                    prop: "padding",
                                    value: 8,
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: false,
                                animations: []
                            }
                                , {
                                className: "!bg-green-800",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(22,101,52,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: true,
                                animations: []
                            }
                                , {
                                className: "first:bg-purple-600",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(147,51,234,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: ["first", "&:first"],
                                precedence: 805437440,
                                important: false,
                                animations: []
                            }
                            ],
                            dark: [],
                            pointer: [],
                            group: [],
                            even: [],
                            first: [],
                            last: [],
                            odd: []
                        }
                        ,
                    }
                    ])
                }>
                    <Text
                        className={`
              text(center xl primary)
              hover:text-gray-700
              `} _twinOrd={0} _twinComponentID="c:a:a:a-1874524712" _twinComponentTemplateEntries={
                            []
                        } _twinComponentSheet={
                            require('@native-twin/jsx').StyleSheet.registerComponent("c:a:a:a-1874524712", [{
                                templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("text-center"), globalStyles.get("text-xl"), globalStyles.get("text-primary"), globalStyles.get("hover:text-gray-700"),].filter(Boolean), rawSheet: {
                                    base: [{
                                        className: "text-center",
                                        declarations: [{
                                            prop: "textAlign",
                                            value: "center",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: [],
                                        precedence: 805306368,
                                        important: false,
                                        animations: []
                                    }
                                        , {
                                        className: "text-xl",
                                        declarations: [{
                                            prop: "fontSize",
                                            value: 20,
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: [],
                                        precedence: 805306368,
                                        important: false,
                                        animations: []
                                    }
                                        , {
                                        className: "text-primary",
                                        declarations: [{
                                            prop: "color",
                                            value: "blue",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: [],
                                        precedence: 805306368,
                                        important: false,
                                        animations: []
                                    }
                                        , {
                                        className: "first:bg-purple-600",
                                        declarations: [{
                                            prop: "backgroundColor",
                                            value: "rgba(147,51,234,1)",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: ["first", "&:first"],
                                        precedence: 805437440,
                                        important: false,
                                        animations: []
                                    }
                                    ],
                                    dark: [],
                                    pointer: [{
                                        className: "hover:text-gray-700",
                                        declarations: [{
                                            prop: "color",
                                            value: "rgba(55,65,81,1)",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: ["hover", "&:hover"],
                                        precedence: 805307392,
                                        important: false,
                                        animations: []
                                    }
                                    ],
                                    group: [],
                                    even: [],
                                    first: [],
                                    last: [],
                                    odd: []
                                }
                                ,
                            }
                            ])
                        }
                    >
                        Hello World
                    </Text>
                </View>
            </View>
            <View
                className={`
          group
          flex-[2]
          !bg-green-800
          bg-gray-500
          hover:bg-pink-600
        `} _twinOrd={1} _twinComponentID="c:b-1154496578" _twinComponentTemplateEntries={
                    []
                } _twinComponentSheet={
                    require('@native-twin/jsx').StyleSheet.registerComponent("c:b-1154496578", [{
                        templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("group"), globalStyles.get("flex-[2]"), globalStyles.get("bg-gray-500"), globalStyles.get("!bg-green-800"), globalStyles.get("hover:bg-pink-600"),].filter(Boolean), rawSheet: {
                            base: [{
                                className: "flex-[2]",
                                declarations: [{
                                    prop: "flex",
                                    value: {
                                        flexGrow: 2,
                                        flexShrink: 2,
                                        flexBasis: "0%"
                                    }
                                    ,
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: false,
                                animations: []
                            }
                                , {
                                className: "bg-gray-500",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(107,114,128,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: false,
                                animations: []
                            }
                                , {
                                className: "!bg-green-800",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(22,101,52,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: [],
                                precedence: 805306368,
                                important: true,
                                animations: []
                            }
                            ],
                            dark: [],
                            pointer: [{
                                className: "hover:bg-pink-600",
                                declarations: [{
                                    prop: "backgroundColor",
                                    value: "rgba(219,39,119,1)",
                                    _tag: "COMPILED"
                                }
                                ],
                                selectors: ["hover", "&:hover"],
                                precedence: 805307392,
                                important: false,
                                animations: []
                            }
                            ],
                            group: [],
                            even: [],
                            first: [],
                            last: [],
                            odd: []
                        }
                        ,
                    }
                    ])
                }
            >
                <Text
                    className={`
            text-2xl
            ${active ? 'text-red-800' : 'text-primary'}
          `} _twinOrd={0} _twinComponentID="c:b:a-89022128" _twinComponentTemplateEntries={
                        [{
                            id: "c:b:a-89022128",
                            target: "style",
                            prop: "className",
                            entries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`),
                            templateLiteral: `${active ? 'text-red-800' : 'text-primary'}`,
                        }
                        ]
                    } _twinComponentSheet={
                        require('@native-twin/jsx').StyleSheet.registerComponent("c:b:a-89022128", [{
                            templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("text-2xl"),].filter(Boolean), rawSheet: {
                                base: [{
                                    className: "text-2xl",
                                    declarations: [{
                                        prop: "fontSize",
                                        value: 24,
                                        _tag: "COMPILED"
                                    }
                                    ],
                                    selectors: [],
                                    precedence: 805306368,
                                    important: false,
                                    animations: []
                                }
                                ],
                                dark: [],
                                pointer: [],
                                group: [],
                                even: [],
                                first: [],
                                last: [],
                                odd: []
                            }
                            ,
                        }
                        ])
                    }
                >
                    Nested Hover22222
                </Text>
                <Pressable
                    onPressIn={() => {
                        setActive((prevState) => !prevState);
                    }} _twinOrd={1} _twinComponentID="c:b:b-32874538" _twinComponentTemplateEntries={
                        []
                    } _twinComponentSheet={
                        require('@native-twin/jsx').StyleSheet.registerComponent("c:b:b-32874538",)
                    }
                >
                    <Text className='text-gray-200' _twinOrd={0} _twinComponentID="c:b:b:a-1664407080" _twinComponentTemplateEntries={
                        []
                    } _twinComponentSheet={
                        require('@native-twin/jsx').StyleSheet.registerComponent("c:b:b:a-1664407080", [{
                            templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("text-gray-200"),].filter(Boolean), rawSheet: {
                                base: [{
                                    className: "text-gray-200",
                                    declarations: [{
                                        prop: "color",
                                        value: "rgba(229,231,235,1)",
                                        _tag: "COMPILED"
                                    }
                                    ],
                                    selectors: [],
                                    precedence: 805306368,
                                    important: false,
                                    animations: []
                                }
                                    , {
                                    className: "first:bg-purple-600",
                                    declarations: [{
                                        prop: "backgroundColor",
                                        value: "rgba(147,51,234,1)",
                                        _tag: "COMPILED"
                                    }
                                    ],
                                    selectors: ["first", "&:first"],
                                    precedence: 805437440,
                                    important: false,
                                    animations: []
                                }
                                ],
                                dark: [],
                                pointer: [],
                                group: [],
                                even: [],
                                first: [],
                                last: [],
                                odd: []
                            }
                            ,
                        }
                        ])
                    }>Activate</Text>
                </Pressable>
                <View
                    className={`
            -top-1
            group-hover:bg-pink-800
          `}
                    debug _twinOrd={2} _twinComponentID="c:b:c-242944440" _twinComponentTemplateEntries={
                        []
                    } _twinComponentSheet={
                        require('@native-twin/jsx').StyleSheet.registerComponent("c:b:c-242944440", [{
                            templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("-top-1"), globalStyles.get("group-hover:bg-pink-800"),].filter(Boolean), rawSheet: {
                                base: [{
                                    className: "-top-1",
                                    declarations: [{
                                        prop: "top",
                                        value: -4,
                                        _tag: "COMPILED"
                                    }
                                    ],
                                    selectors: [],
                                    precedence: 805306368,
                                    important: false,
                                    animations: []
                                }
                                ],
                                dark: [],
                                pointer: [],
                                group: [{
                                    className: "group-hover:bg-pink-800",
                                    declarations: [{
                                        prop: "backgroundColor",
                                        value: "rgba(157,23,77,1)",
                                        _tag: "COMPILED"
                                    }
                                    ],
                                    selectors: ["group-hover", ".group:hover &"],
                                    precedence: 805307392,
                                    important: false,
                                    animations: []
                                }
                                ],
                                even: [],
                                first: [],
                                last: [],
                                odd: []
                            }
                            ,
                        }
                        ])
                    }
                >
                    <Text
                        suppressHighlighting
                        className='text-gray-800 group-hover:text-white' _twinOrd={0} _twinComponentID="c:b:c:a-1720548971" _twinComponentTemplateEntries={
                            []
                        } _twinComponentSheet={
                            require('@native-twin/jsx').StyleSheet.registerComponent("c:b:c:a-1720548971", [{
                                templateLiteral: null, prop: "className", target: "style", entries: [globalStyles.get("text-gray-800"), globalStyles.get("group-hover:text-white"),].filter(Boolean), rawSheet: {
                                    base: [{
                                        className: "text-gray-800",
                                        declarations: [{
                                            prop: "color",
                                            value: "rgba(31,41,55,1)",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: [],
                                        precedence: 805306368,
                                        important: false,
                                        animations: []
                                    }
                                        , {
                                        className: "first:bg-purple-600",
                                        declarations: [{
                                            prop: "backgroundColor",
                                            value: "rgba(147,51,234,1)",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: ["first", "&:first"],
                                        precedence: 805437440,
                                        important: false,
                                        animations: []
                                    }
                                    ],
                                    dark: [],
                                    pointer: [],
                                    group: [{
                                        className: "group-hover:text-white",
                                        declarations: [{
                                            prop: "color",
                                            value: "rgba(255,255,255,1)",
                                            _tag: "COMPILED"
                                        }
                                        ],
                                        selectors: ["group-hover", ".group:hover &"],
                                        precedence: 805307392,
                                        important: false,
                                        animations: []
                                    }
                                    ],
                                    even: [],
                                    first: [],
                                    last: [],
                                    odd: []
                                }
                                ,
                            }
                            ])
                        }
                    >
                        Deeply nested hover
                    </Text>
                </View>
            </View>
        </View>
    );
}

export { HomeScreen };
