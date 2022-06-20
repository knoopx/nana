import classNames from "classnames";
import { HTMLAttributes } from "react";
import {
    humanDuration,
    humanFileSize,
    UInt8ArrayToString,
} from "../support/formatting";

const Table = ({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <table
        className={classNames(
            className,
            "table-compact overflow-hidden rounded"
        )}
        {...props}
    >
        {children}
    </table>
);

const Row = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <tr
        className={classNames(
            className,
            "hover odd:bg-base-200 even:bg-base-300"
        )}
        {...props}
    />
);

const Cell = ({
    header,
    className,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    header?: boolean;
}) => {
    const Component = header ? "th" : "td";
    return (
        <Component
            className={classNames(
                className,
                "border border-base-300  text-left",
                {}
            )}
            {...props}
        />
    );
};

const Image = ({ value, type }: { value: any; type: string }) => (
    <img
        className="h-auto max-w-full"
        src={`data:${type};base64,${btoa(
            UInt8ArrayToString(new Uint8Array(value))
        )}`}
    />
);

const Binary = ({ value: { val } }: { value: any }): any => {
    if (val[0] == 0x89 && val[1] == 0x50 && val[2] == 0x4e && val[3] == 0x47) {
        return <Image value={val} type="image/png" />;
    } else {
        // todo
    }
};

const Pre = ({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLPreElement>): any => {
    if (typeof children === "string") {
        if (children.split("\n").length == 1) {
            return children;
        }
    }
    return (
        <pre
            className={classNames(
                className,
                "overflow-auto rounded bg-base-300 p-4"
            )}
            {...props}
        >
            {children}
        </pre>
    );
};

const Record = ({ value: { cols, vals } }: { value: any }) => (
    <Table>
        <tbody>
            {vals.map((val: any, i: number) => (
                <Row key={i}>
                    <Cell header>{cols[i]}</Cell>
                    <Cell>
                        <Output value={val} />
                    </Cell>
                </Row>
            ))}
        </tbody>
    </Table>
);

const List = ({ value: { vals } }: { value: any }): any => {
    if (vals.length > 0) {
        const isRecordList = vals.every((v: any) => v.Record);
        const cols = isRecordList ? vals[0].Record.cols : [];
        const Columns = (
            <thead>
                <Row>
                    {cols.map((col: string, i: number) => (
                        <Cell header key={i}>
                            {col}
                        </Cell>
                    ))}
                </Row>
            </thead>
        );

        return (
            <Table>
                {Columns}
                <tbody>
                    {vals.map((value: any, i: number) => (
                        <Row key={i}>
                            {isRecordList ? (
                                value.Record.vals.map((v: any, j: number) => (
                                    <Cell key={j}>
                                        <Output value={v}></Output>
                                    </Cell>
                                ))
                            ) : (
                                <>
                                    {/* <Cell className="text-right">{i}</Cell> */}
                                    <Cell>
                                        <Output value={value}></Output>
                                    </Cell>
                                </>
                            )}
                        </Row>
                    ))}
                </tbody>
                {/* {Columns} */}
            </Table>
        );
    }

    return [];
};

export const Output = ({ value }: { value: any }): any => {
    if (!value || value.Nothing) {
        return null;
    } else if (value.Int) {
        return value.Int.val.toString();
    } else if (value.Float) {
        return value.Float.val.toString();
    } else if (value.Bool) {
        return value.Bool.val.toString();
    } else if (value.String) {
        return value.String.val ? <Pre>{value.String.val}</Pre> : <>&nbsp;</>;
    } else if (value.Filesize) {
        return humanFileSize(value.Filesize.val);
    } else if (value.Duration) {
        return humanDuration(value.Duration.val);
    } else if (value.Date) {
        return new Date(Date.parse(value.Date.val)).toISOString();
    } else if (value.Binary) {
        return <Binary value={value.Binary} />;
    } else if (value.Record) {
        return <Record value={value.Record} />;
    } else if (value.List) {
        return <List value={value.List}></List>;
    }

    // todo: use rehype-sanitize
    return <Pre dangerouslySetInnerHTML={{ __html: value }} />;
};
