// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';

const ChildProp = () => {
    return (
        <View className='bg-black last:text-lg' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/childs/code.tsx-134-279-View" _twinComponentTemplateEntries={
            []
        } _twinComponentSheet={
            require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/childs/code.tsx-134-279-View", [{
                templateLiteral: null,
                prop: "className",
                target: "style",
                rawEntries: [{
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
                    , {
                    className: "last:text-lg",
                    declarations: [{
                        prop: "fontSize",
                        value: 18,
                        _tag: "COMPILED"
                    }
                    ],
                    selectors: ["last", "&:last"],
                    precedence: 805437440,
                    important: false,
                    animations: []
                }
                ],
                entries: {
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
                    last: [{
                        className: "last:text-lg",
                        declarations: [{
                            prop: "fontSize",
                            value: 18,
                            _tag: "COMPILED"
                        }
                        ],
                        selectors: ["last", "&:last"],
                        precedence: 805437440,
                        important: false,
                        animations: []
                    }
                    ],
                    odd: []
                }
                ,
                metadata: {
                    hasAnimations: false,
                    hasGroupEvents: false,
                    hasPointerEvents: false,
                    isGroupParent: false
                }
            }
            ])
        }>
            <Text className='text-blue' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/childs/code.tsx-181-221-Text" _twinComponentTemplateEntries={
                []
            } _twinComponentSheet={
                require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/childs/code.tsx-181-221-Text", [{
                    templateLiteral: null,
                    prop: "className",
                    target: "style",
                    rawEntries: [{
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
                    ],
                    entries: {
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
                    metadata: {
                        hasAnimations: false,
                        hasGroupEvents: false,
                        hasPointerEvents: false,
                        isGroupParent: false
                    }
                }
                ])
            }>Text1</Text>
            <Text className='text-red' _twinOrd={1} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/childs/code.tsx-228-267-Text" _twinComponentTemplateEntries={
                []
            } _twinComponentSheet={
                require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/childs/code.tsx-228-267-Text", [{
                    templateLiteral: null,
                    prop: "className",
                    target: "style",
                    rawEntries: [{
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
                    entries: {
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
                            , {
                            className: "last:text-lg",
                            declarations: [{
                                prop: "fontSize",
                                value: 18,
                                _tag: "COMPILED"
                            }
                            ],
                            selectors: ["last", "&:last"],
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
                    metadata: {
                        hasAnimations: false,
                        hasGroupEvents: false,
                        hasPointerEvents: false,
                        isGroupParent: false
                    }
                }
                ])
            }>Text2</Text>
        </View>
    );
};

export { ChildProp };
