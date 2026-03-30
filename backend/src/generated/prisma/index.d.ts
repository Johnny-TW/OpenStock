/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Portfolio
 *
 */
export type Portfolio = $Result.DefaultSelection<Prisma.$PortfolioPayload>;
/**
 * Model Watchlist
 *
 */
export type Watchlist = $Result.DefaultSelection<Prisma.$WatchlistPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Portfolios
 * const portfolios = await prisma.portfolio.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Portfolios
   * const portfolios = await prisma.portfolio.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  );
  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent,
    ) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.portfolio`: Exposes CRUD operations for the **Portfolio** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Portfolios
   * const portfolios = await prisma.portfolio.findMany()
   * ```
   */
  get portfolio(): Prisma.PortfolioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.watchlist`: Exposes CRUD operations for the **Watchlist** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Watchlists
   * const watchlists = await prisma.watchlist.findMany()
   * ```
   */
  get watchlist(): Prisma.WatchlistDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import Bytes = runtime.Bytes;
  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends bigint
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Portfolio: 'Portfolio';
    Watchlist: 'Watchlist';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<
    { extArgs: $Extensions.InternalArgs },
    $Utils.Record<string, any>
  > {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: 'portfolio' | 'watchlist';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Portfolio: {
        payload: Prisma.$PortfolioPayload<ExtArgs>;
        fields: Prisma.PortfolioFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PortfolioFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PortfolioFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>;
          };
          findFirst: {
            args: Prisma.PortfolioFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PortfolioFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>;
          };
          findMany: {
            args: Prisma.PortfolioFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>[];
          };
          create: {
            args: Prisma.PortfolioCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>;
          };
          createMany: {
            args: Prisma.PortfolioCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PortfolioCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>[];
          };
          delete: {
            args: Prisma.PortfolioDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>;
          };
          update: {
            args: Prisma.PortfolioUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>;
          };
          deleteMany: {
            args: Prisma.PortfolioDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PortfolioUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.PortfolioUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>[];
          };
          upsert: {
            args: Prisma.PortfolioUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>;
          };
          aggregate: {
            args: Prisma.PortfolioAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePortfolio>;
          };
          groupBy: {
            args: Prisma.PortfolioGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PortfolioGroupByOutputType>[];
          };
          count: {
            args: Prisma.PortfolioCountArgs<ExtArgs>;
            result: $Utils.Optional<PortfolioCountAggregateOutputType> | number;
          };
        };
      };
      Watchlist: {
        payload: Prisma.$WatchlistPayload<ExtArgs>;
        fields: Prisma.WatchlistFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.WatchlistFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.WatchlistFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>;
          };
          findFirst: {
            args: Prisma.WatchlistFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.WatchlistFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>;
          };
          findMany: {
            args: Prisma.WatchlistFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>[];
          };
          create: {
            args: Prisma.WatchlistCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>;
          };
          createMany: {
            args: Prisma.WatchlistCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.WatchlistCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>[];
          };
          delete: {
            args: Prisma.WatchlistDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>;
          };
          update: {
            args: Prisma.WatchlistUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>;
          };
          deleteMany: {
            args: Prisma.WatchlistDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.WatchlistUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.WatchlistUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>[];
          };
          upsert: {
            args: Prisma.WatchlistUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WatchlistPayload>;
          };
          aggregate: {
            args: Prisma.WatchlistAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateWatchlist>;
          };
          groupBy: {
            args: Prisma.WatchlistGroupByArgs<ExtArgs>;
            result: $Utils.Optional<WatchlistGroupByOutputType>[];
          };
          count: {
            args: Prisma.WatchlistCountArgs<ExtArgs>;
            result: $Utils.Optional<WatchlistCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null;
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    portfolio?: PortfolioOmit;
    watchlist?: WatchlistOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>,
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Models
   */

  /**
   * Model Portfolio
   */

  export type AggregatePortfolio = {
    _count: PortfolioCountAggregateOutputType | null;
    _avg: PortfolioAvgAggregateOutputType | null;
    _sum: PortfolioSumAggregateOutputType | null;
    _min: PortfolioMinAggregateOutputType | null;
    _max: PortfolioMaxAggregateOutputType | null;
  };

  export type PortfolioAvgAggregateOutputType = {
    id: number | null;
    buyPrice: number | null;
    shares: number | null;
  };

  export type PortfolioSumAggregateOutputType = {
    id: number | null;
    buyPrice: number | null;
    shares: number | null;
  };

  export type PortfolioMinAggregateOutputType = {
    id: number | null;
    userId: string | null;
    stockNo: string | null;
    stockName: string | null;
    buyPrice: number | null;
    buyDate: Date | null;
    shares: number | null;
    memo: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PortfolioMaxAggregateOutputType = {
    id: number | null;
    userId: string | null;
    stockNo: string | null;
    stockName: string | null;
    buyPrice: number | null;
    buyDate: Date | null;
    shares: number | null;
    memo: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PortfolioCountAggregateOutputType = {
    id: number;
    userId: number;
    stockNo: number;
    stockName: number;
    buyPrice: number;
    buyDate: number;
    shares: number;
    memo: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type PortfolioAvgAggregateInputType = {
    id?: true;
    buyPrice?: true;
    shares?: true;
  };

  export type PortfolioSumAggregateInputType = {
    id?: true;
    buyPrice?: true;
    shares?: true;
  };

  export type PortfolioMinAggregateInputType = {
    id?: true;
    userId?: true;
    stockNo?: true;
    stockName?: true;
    buyPrice?: true;
    buyDate?: true;
    shares?: true;
    memo?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PortfolioMaxAggregateInputType = {
    id?: true;
    userId?: true;
    stockNo?: true;
    stockName?: true;
    buyPrice?: true;
    buyDate?: true;
    shares?: true;
    memo?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PortfolioCountAggregateInputType = {
    id?: true;
    userId?: true;
    stockNo?: true;
    stockName?: true;
    buyPrice?: true;
    buyDate?: true;
    shares?: true;
    memo?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type PortfolioAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Portfolio to aggregate.
     */
    where?: PortfolioWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Portfolios to fetch.
     */
    orderBy?:
      | PortfolioOrderByWithRelationInput
      | PortfolioOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PortfolioWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Portfolios.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Portfolios
     **/
    _count?: true | PortfolioCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: PortfolioAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: PortfolioSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PortfolioMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PortfolioMaxAggregateInputType;
  };

  export type GetPortfolioAggregateType<T extends PortfolioAggregateArgs> = {
    [P in keyof T & keyof AggregatePortfolio]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortfolio[P]>
      : GetScalarType<T[P], AggregatePortfolio[P]>;
  };

  export type PortfolioGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PortfolioWhereInput;
    orderBy?:
      | PortfolioOrderByWithAggregationInput
      | PortfolioOrderByWithAggregationInput[];
    by: PortfolioScalarFieldEnum[] | PortfolioScalarFieldEnum;
    having?: PortfolioScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PortfolioCountAggregateInputType | true;
    _avg?: PortfolioAvgAggregateInputType;
    _sum?: PortfolioSumAggregateInputType;
    _min?: PortfolioMinAggregateInputType;
    _max?: PortfolioMaxAggregateInputType;
  };

  export type PortfolioGroupByOutputType = {
    id: number;
    userId: string;
    stockNo: string;
    stockName: string;
    buyPrice: number;
    buyDate: Date;
    shares: number;
    memo: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: PortfolioCountAggregateOutputType | null;
    _avg: PortfolioAvgAggregateOutputType | null;
    _sum: PortfolioSumAggregateOutputType | null;
    _min: PortfolioMinAggregateOutputType | null;
    _max: PortfolioMaxAggregateOutputType | null;
  };

  type GetPortfolioGroupByPayload<T extends PortfolioGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<PortfolioGroupByOutputType, T['by']> & {
          [P in keyof T & keyof PortfolioGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortfolioGroupByOutputType[P]>
            : GetScalarType<T[P], PortfolioGroupByOutputType[P]>;
        }
      >
    >;

  export type PortfolioSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      stockNo?: boolean;
      stockName?: boolean;
      buyPrice?: boolean;
      buyDate?: boolean;
      shares?: boolean;
      memo?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['portfolio']
  >;

  export type PortfolioSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      stockNo?: boolean;
      stockName?: boolean;
      buyPrice?: boolean;
      buyDate?: boolean;
      shares?: boolean;
      memo?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['portfolio']
  >;

  export type PortfolioSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      stockNo?: boolean;
      stockName?: boolean;
      buyPrice?: boolean;
      buyDate?: boolean;
      shares?: boolean;
      memo?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['portfolio']
  >;

  export type PortfolioSelectScalar = {
    id?: boolean;
    userId?: boolean;
    stockNo?: boolean;
    stockName?: boolean;
    buyPrice?: boolean;
    buyDate?: boolean;
    shares?: boolean;
    memo?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type PortfolioOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'userId'
    | 'stockNo'
    | 'stockName'
    | 'buyPrice'
    | 'buyDate'
    | 'shares'
    | 'memo'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['portfolio']
  >;

  export type $PortfolioPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Portfolio';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        userId: string;
        stockNo: string;
        stockName: string;
        buyPrice: number;
        buyDate: Date;
        shares: number;
        memo: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['portfolio']
    >;
    composites: {};
  };

  type PortfolioGetPayload<
    S extends boolean | null | undefined | PortfolioDefaultArgs,
  > = $Result.GetResult<Prisma.$PortfolioPayload, S>;

  type PortfolioCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    PortfolioFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: PortfolioCountAggregateInputType | true;
  };

  export interface PortfolioDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Portfolio'];
      meta: { name: 'Portfolio' };
    };
    /**
     * Find zero or one Portfolio that matches the filter.
     * @param {PortfolioFindUniqueArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortfolioFindUniqueArgs>(
      args: SelectSubset<T, PortfolioFindUniqueArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Portfolio that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortfolioFindUniqueOrThrowArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortfolioFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PortfolioFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Portfolio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioFindFirstArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortfolioFindFirstArgs>(
      args?: SelectSubset<T, PortfolioFindFirstArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Portfolio that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioFindFirstOrThrowArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortfolioFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PortfolioFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Portfolios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Portfolios
     * const portfolios = await prisma.portfolio.findMany()
     *
     * // Get first 10 Portfolios
     * const portfolios = await prisma.portfolio.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const portfolioWithIdOnly = await prisma.portfolio.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PortfolioFindManyArgs>(
      args?: SelectSubset<T, PortfolioFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Portfolio.
     * @param {PortfolioCreateArgs} args - Arguments to create a Portfolio.
     * @example
     * // Create one Portfolio
     * const Portfolio = await prisma.portfolio.create({
     *   data: {
     *     // ... data to create a Portfolio
     *   }
     * })
     *
     */
    create<T extends PortfolioCreateArgs>(
      args: SelectSubset<T, PortfolioCreateArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Portfolios.
     * @param {PortfolioCreateManyArgs} args - Arguments to create many Portfolios.
     * @example
     * // Create many Portfolios
     * const portfolio = await prisma.portfolio.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PortfolioCreateManyArgs>(
      args?: SelectSubset<T, PortfolioCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Portfolios and returns the data saved in the database.
     * @param {PortfolioCreateManyAndReturnArgs} args - Arguments to create many Portfolios.
     * @example
     * // Create many Portfolios
     * const portfolio = await prisma.portfolio.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Portfolios and only return the `id`
     * const portfolioWithIdOnly = await prisma.portfolio.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PortfolioCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PortfolioCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Portfolio.
     * @param {PortfolioDeleteArgs} args - Arguments to delete one Portfolio.
     * @example
     * // Delete one Portfolio
     * const Portfolio = await prisma.portfolio.delete({
     *   where: {
     *     // ... filter to delete one Portfolio
     *   }
     * })
     *
     */
    delete<T extends PortfolioDeleteArgs>(
      args: SelectSubset<T, PortfolioDeleteArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Portfolio.
     * @param {PortfolioUpdateArgs} args - Arguments to update one Portfolio.
     * @example
     * // Update one Portfolio
     * const portfolio = await prisma.portfolio.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PortfolioUpdateArgs>(
      args: SelectSubset<T, PortfolioUpdateArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Portfolios.
     * @param {PortfolioDeleteManyArgs} args - Arguments to filter Portfolios to delete.
     * @example
     * // Delete a few Portfolios
     * const { count } = await prisma.portfolio.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PortfolioDeleteManyArgs>(
      args?: SelectSubset<T, PortfolioDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Portfolios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Portfolios
     * const portfolio = await prisma.portfolio.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PortfolioUpdateManyArgs>(
      args: SelectSubset<T, PortfolioUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Portfolios and returns the data updated in the database.
     * @param {PortfolioUpdateManyAndReturnArgs} args - Arguments to update many Portfolios.
     * @example
     * // Update many Portfolios
     * const portfolio = await prisma.portfolio.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Portfolios and only return the `id`
     * const portfolioWithIdOnly = await prisma.portfolio.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PortfolioUpdateManyAndReturnArgs>(
      args: SelectSubset<T, PortfolioUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Portfolio.
     * @param {PortfolioUpsertArgs} args - Arguments to update or create a Portfolio.
     * @example
     * // Update or create a Portfolio
     * const portfolio = await prisma.portfolio.upsert({
     *   create: {
     *     // ... data to create a Portfolio
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Portfolio we want to update
     *   }
     * })
     */
    upsert<T extends PortfolioUpsertArgs>(
      args: SelectSubset<T, PortfolioUpsertArgs<ExtArgs>>,
    ): Prisma__PortfolioClient<
      $Result.GetResult<
        Prisma.$PortfolioPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Portfolios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioCountArgs} args - Arguments to filter Portfolios to count.
     * @example
     * // Count the number of Portfolios
     * const count = await prisma.portfolio.count({
     *   where: {
     *     // ... the filter for the Portfolios we want to count
     *   }
     * })
     **/
    count<T extends PortfolioCountArgs>(
      args?: Subset<T, PortfolioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortfolioCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Portfolio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PortfolioAggregateArgs>(
      args: Subset<T, PortfolioAggregateArgs>,
    ): Prisma.PrismaPromise<GetPortfolioAggregateType<T>>;

    /**
     * Group by Portfolio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PortfolioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortfolioGroupByArgs['orderBy'] }
        : { orderBy?: PortfolioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PortfolioGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetPortfolioGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Portfolio model
     */
    readonly fields: PortfolioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Portfolio.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortfolioClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Portfolio model
   */
  interface PortfolioFieldRefs {
    readonly id: FieldRef<'Portfolio', 'Int'>;
    readonly userId: FieldRef<'Portfolio', 'String'>;
    readonly stockNo: FieldRef<'Portfolio', 'String'>;
    readonly stockName: FieldRef<'Portfolio', 'String'>;
    readonly buyPrice: FieldRef<'Portfolio', 'Float'>;
    readonly buyDate: FieldRef<'Portfolio', 'DateTime'>;
    readonly shares: FieldRef<'Portfolio', 'Int'>;
    readonly memo: FieldRef<'Portfolio', 'String'>;
    readonly createdAt: FieldRef<'Portfolio', 'DateTime'>;
    readonly updatedAt: FieldRef<'Portfolio', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Portfolio findUnique
   */
  export type PortfolioFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * Filter, which Portfolio to fetch.
     */
    where: PortfolioWhereUniqueInput;
  };

  /**
   * Portfolio findUniqueOrThrow
   */
  export type PortfolioFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * Filter, which Portfolio to fetch.
     */
    where: PortfolioWhereUniqueInput;
  };

  /**
   * Portfolio findFirst
   */
  export type PortfolioFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * Filter, which Portfolio to fetch.
     */
    where?: PortfolioWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Portfolios to fetch.
     */
    orderBy?:
      | PortfolioOrderByWithRelationInput
      | PortfolioOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Portfolios.
     */
    cursor?: PortfolioWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Portfolios.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Portfolios.
     */
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[];
  };

  /**
   * Portfolio findFirstOrThrow
   */
  export type PortfolioFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * Filter, which Portfolio to fetch.
     */
    where?: PortfolioWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Portfolios to fetch.
     */
    orderBy?:
      | PortfolioOrderByWithRelationInput
      | PortfolioOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Portfolios.
     */
    cursor?: PortfolioWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Portfolios.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Portfolios.
     */
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[];
  };

  /**
   * Portfolio findMany
   */
  export type PortfolioFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * Filter, which Portfolios to fetch.
     */
    where?: PortfolioWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Portfolios to fetch.
     */
    orderBy?:
      | PortfolioOrderByWithRelationInput
      | PortfolioOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Portfolios.
     */
    cursor?: PortfolioWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Portfolios.
     */
    skip?: number;
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[];
  };

  /**
   * Portfolio create
   */
  export type PortfolioCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * The data needed to create a Portfolio.
     */
    data: XOR<PortfolioCreateInput, PortfolioUncheckedCreateInput>;
  };

  /**
   * Portfolio createMany
   */
  export type PortfolioCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Portfolios.
     */
    data: PortfolioCreateManyInput | PortfolioCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Portfolio createManyAndReturn
   */
  export type PortfolioCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * The data used to create many Portfolios.
     */
    data: PortfolioCreateManyInput | PortfolioCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Portfolio update
   */
  export type PortfolioUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * The data needed to update a Portfolio.
     */
    data: XOR<PortfolioUpdateInput, PortfolioUncheckedUpdateInput>;
    /**
     * Choose, which Portfolio to update.
     */
    where: PortfolioWhereUniqueInput;
  };

  /**
   * Portfolio updateMany
   */
  export type PortfolioUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Portfolios.
     */
    data: XOR<
      PortfolioUpdateManyMutationInput,
      PortfolioUncheckedUpdateManyInput
    >;
    /**
     * Filter which Portfolios to update
     */
    where?: PortfolioWhereInput;
    /**
     * Limit how many Portfolios to update.
     */
    limit?: number;
  };

  /**
   * Portfolio updateManyAndReturn
   */
  export type PortfolioUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * The data used to update Portfolios.
     */
    data: XOR<
      PortfolioUpdateManyMutationInput,
      PortfolioUncheckedUpdateManyInput
    >;
    /**
     * Filter which Portfolios to update
     */
    where?: PortfolioWhereInput;
    /**
     * Limit how many Portfolios to update.
     */
    limit?: number;
  };

  /**
   * Portfolio upsert
   */
  export type PortfolioUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * The filter to search for the Portfolio to update in case it exists.
     */
    where: PortfolioWhereUniqueInput;
    /**
     * In case the Portfolio found by the `where` argument doesn't exist, create a new Portfolio with this data.
     */
    create: XOR<PortfolioCreateInput, PortfolioUncheckedCreateInput>;
    /**
     * In case the Portfolio was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortfolioUpdateInput, PortfolioUncheckedUpdateInput>;
  };

  /**
   * Portfolio delete
   */
  export type PortfolioDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
    /**
     * Filter which Portfolio to delete.
     */
    where: PortfolioWhereUniqueInput;
  };

  /**
   * Portfolio deleteMany
   */
  export type PortfolioDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Portfolios to delete
     */
    where?: PortfolioWhereInput;
    /**
     * Limit how many Portfolios to delete.
     */
    limit?: number;
  };

  /**
   * Portfolio without action
   */
  export type PortfolioDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null;
  };

  /**
   * Model Watchlist
   */

  export type AggregateWatchlist = {
    _count: WatchlistCountAggregateOutputType | null;
    _avg: WatchlistAvgAggregateOutputType | null;
    _sum: WatchlistSumAggregateOutputType | null;
    _min: WatchlistMinAggregateOutputType | null;
    _max: WatchlistMaxAggregateOutputType | null;
  };

  export type WatchlistAvgAggregateOutputType = {
    id: number | null;
  };

  export type WatchlistSumAggregateOutputType = {
    id: number | null;
  };

  export type WatchlistMinAggregateOutputType = {
    id: number | null;
    userId: string | null;
    stockNo: string | null;
    stockName: string | null;
    createdAt: Date | null;
  };

  export type WatchlistMaxAggregateOutputType = {
    id: number | null;
    userId: string | null;
    stockNo: string | null;
    stockName: string | null;
    createdAt: Date | null;
  };

  export type WatchlistCountAggregateOutputType = {
    id: number;
    userId: number;
    stockNo: number;
    stockName: number;
    createdAt: number;
    _all: number;
  };

  export type WatchlistAvgAggregateInputType = {
    id?: true;
  };

  export type WatchlistSumAggregateInputType = {
    id?: true;
  };

  export type WatchlistMinAggregateInputType = {
    id?: true;
    userId?: true;
    stockNo?: true;
    stockName?: true;
    createdAt?: true;
  };

  export type WatchlistMaxAggregateInputType = {
    id?: true;
    userId?: true;
    stockNo?: true;
    stockName?: true;
    createdAt?: true;
  };

  export type WatchlistCountAggregateInputType = {
    id?: true;
    userId?: true;
    stockNo?: true;
    stockName?: true;
    createdAt?: true;
    _all?: true;
  };

  export type WatchlistAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Watchlist to aggregate.
     */
    where?: WatchlistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Watchlists to fetch.
     */
    orderBy?:
      | WatchlistOrderByWithRelationInput
      | WatchlistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WatchlistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Watchlists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Watchlists
     **/
    _count?: true | WatchlistCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: WatchlistAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: WatchlistSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: WatchlistMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: WatchlistMaxAggregateInputType;
  };

  export type GetWatchlistAggregateType<T extends WatchlistAggregateArgs> = {
    [P in keyof T & keyof AggregateWatchlist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWatchlist[P]>
      : GetScalarType<T[P], AggregateWatchlist[P]>;
  };

  export type WatchlistGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WatchlistWhereInput;
    orderBy?:
      | WatchlistOrderByWithAggregationInput
      | WatchlistOrderByWithAggregationInput[];
    by: WatchlistScalarFieldEnum[] | WatchlistScalarFieldEnum;
    having?: WatchlistScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WatchlistCountAggregateInputType | true;
    _avg?: WatchlistAvgAggregateInputType;
    _sum?: WatchlistSumAggregateInputType;
    _min?: WatchlistMinAggregateInputType;
    _max?: WatchlistMaxAggregateInputType;
  };

  export type WatchlistGroupByOutputType = {
    id: number;
    userId: string;
    stockNo: string;
    stockName: string;
    createdAt: Date;
    _count: WatchlistCountAggregateOutputType | null;
    _avg: WatchlistAvgAggregateOutputType | null;
    _sum: WatchlistSumAggregateOutputType | null;
    _min: WatchlistMinAggregateOutputType | null;
    _max: WatchlistMaxAggregateOutputType | null;
  };

  type GetWatchlistGroupByPayload<T extends WatchlistGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<WatchlistGroupByOutputType, T['by']> & {
          [P in keyof T & keyof WatchlistGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WatchlistGroupByOutputType[P]>
            : GetScalarType<T[P], WatchlistGroupByOutputType[P]>;
        }
      >
    >;

  export type WatchlistSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      stockNo?: boolean;
      stockName?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['watchlist']
  >;

  export type WatchlistSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      stockNo?: boolean;
      stockName?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['watchlist']
  >;

  export type WatchlistSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      stockNo?: boolean;
      stockName?: boolean;
      createdAt?: boolean;
    },
    ExtArgs['result']['watchlist']
  >;

  export type WatchlistSelectScalar = {
    id?: boolean;
    userId?: boolean;
    stockNo?: boolean;
    stockName?: boolean;
    createdAt?: boolean;
  };

  export type WatchlistOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'id' | 'userId' | 'stockNo' | 'stockName' | 'createdAt',
    ExtArgs['result']['watchlist']
  >;

  export type $WatchlistPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Watchlist';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        userId: string;
        stockNo: string;
        stockName: string;
        createdAt: Date;
      },
      ExtArgs['result']['watchlist']
    >;
    composites: {};
  };

  type WatchlistGetPayload<
    S extends boolean | null | undefined | WatchlistDefaultArgs,
  > = $Result.GetResult<Prisma.$WatchlistPayload, S>;

  type WatchlistCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    WatchlistFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: WatchlistCountAggregateInputType | true;
  };

  export interface WatchlistDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Watchlist'];
      meta: { name: 'Watchlist' };
    };
    /**
     * Find zero or one Watchlist that matches the filter.
     * @param {WatchlistFindUniqueArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WatchlistFindUniqueArgs>(
      args: SelectSubset<T, WatchlistFindUniqueArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Watchlist that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WatchlistFindUniqueOrThrowArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WatchlistFindUniqueOrThrowArgs>(
      args: SelectSubset<T, WatchlistFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Watchlist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistFindFirstArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WatchlistFindFirstArgs>(
      args?: SelectSubset<T, WatchlistFindFirstArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Watchlist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistFindFirstOrThrowArgs} args - Arguments to find a Watchlist
     * @example
     * // Get one Watchlist
     * const watchlist = await prisma.watchlist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WatchlistFindFirstOrThrowArgs>(
      args?: SelectSubset<T, WatchlistFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Watchlists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Watchlists
     * const watchlists = await prisma.watchlist.findMany()
     *
     * // Get first 10 Watchlists
     * const watchlists = await prisma.watchlist.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const watchlistWithIdOnly = await prisma.watchlist.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WatchlistFindManyArgs>(
      args?: SelectSubset<T, WatchlistFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Watchlist.
     * @param {WatchlistCreateArgs} args - Arguments to create a Watchlist.
     * @example
     * // Create one Watchlist
     * const Watchlist = await prisma.watchlist.create({
     *   data: {
     *     // ... data to create a Watchlist
     *   }
     * })
     *
     */
    create<T extends WatchlistCreateArgs>(
      args: SelectSubset<T, WatchlistCreateArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Watchlists.
     * @param {WatchlistCreateManyArgs} args - Arguments to create many Watchlists.
     * @example
     * // Create many Watchlists
     * const watchlist = await prisma.watchlist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WatchlistCreateManyArgs>(
      args?: SelectSubset<T, WatchlistCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Watchlists and returns the data saved in the database.
     * @param {WatchlistCreateManyAndReturnArgs} args - Arguments to create many Watchlists.
     * @example
     * // Create many Watchlists
     * const watchlist = await prisma.watchlist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Watchlists and only return the `id`
     * const watchlistWithIdOnly = await prisma.watchlist.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WatchlistCreateManyAndReturnArgs>(
      args?: SelectSubset<T, WatchlistCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Watchlist.
     * @param {WatchlistDeleteArgs} args - Arguments to delete one Watchlist.
     * @example
     * // Delete one Watchlist
     * const Watchlist = await prisma.watchlist.delete({
     *   where: {
     *     // ... filter to delete one Watchlist
     *   }
     * })
     *
     */
    delete<T extends WatchlistDeleteArgs>(
      args: SelectSubset<T, WatchlistDeleteArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Watchlist.
     * @param {WatchlistUpdateArgs} args - Arguments to update one Watchlist.
     * @example
     * // Update one Watchlist
     * const watchlist = await prisma.watchlist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WatchlistUpdateArgs>(
      args: SelectSubset<T, WatchlistUpdateArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Watchlists.
     * @param {WatchlistDeleteManyArgs} args - Arguments to filter Watchlists to delete.
     * @example
     * // Delete a few Watchlists
     * const { count } = await prisma.watchlist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WatchlistDeleteManyArgs>(
      args?: SelectSubset<T, WatchlistDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Watchlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Watchlists
     * const watchlist = await prisma.watchlist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WatchlistUpdateManyArgs>(
      args: SelectSubset<T, WatchlistUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Watchlists and returns the data updated in the database.
     * @param {WatchlistUpdateManyAndReturnArgs} args - Arguments to update many Watchlists.
     * @example
     * // Update many Watchlists
     * const watchlist = await prisma.watchlist.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Watchlists and only return the `id`
     * const watchlistWithIdOnly = await prisma.watchlist.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends WatchlistUpdateManyAndReturnArgs>(
      args: SelectSubset<T, WatchlistUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Watchlist.
     * @param {WatchlistUpsertArgs} args - Arguments to update or create a Watchlist.
     * @example
     * // Update or create a Watchlist
     * const watchlist = await prisma.watchlist.upsert({
     *   create: {
     *     // ... data to create a Watchlist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Watchlist we want to update
     *   }
     * })
     */
    upsert<T extends WatchlistUpsertArgs>(
      args: SelectSubset<T, WatchlistUpsertArgs<ExtArgs>>,
    ): Prisma__WatchlistClient<
      $Result.GetResult<
        Prisma.$WatchlistPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Watchlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistCountArgs} args - Arguments to filter Watchlists to count.
     * @example
     * // Count the number of Watchlists
     * const count = await prisma.watchlist.count({
     *   where: {
     *     // ... the filter for the Watchlists we want to count
     *   }
     * })
     **/
    count<T extends WatchlistCountArgs>(
      args?: Subset<T, WatchlistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WatchlistCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Watchlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends WatchlistAggregateArgs>(
      args: Subset<T, WatchlistAggregateArgs>,
    ): Prisma.PrismaPromise<GetWatchlistAggregateType<T>>;

    /**
     * Group by Watchlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WatchlistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends WatchlistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WatchlistGroupByArgs['orderBy'] }
        : { orderBy?: WatchlistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, WatchlistGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetWatchlistGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Watchlist model
     */
    readonly fields: WatchlistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Watchlist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WatchlistClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Watchlist model
   */
  interface WatchlistFieldRefs {
    readonly id: FieldRef<'Watchlist', 'Int'>;
    readonly userId: FieldRef<'Watchlist', 'String'>;
    readonly stockNo: FieldRef<'Watchlist', 'String'>;
    readonly stockName: FieldRef<'Watchlist', 'String'>;
    readonly createdAt: FieldRef<'Watchlist', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Watchlist findUnique
   */
  export type WatchlistFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * Filter, which Watchlist to fetch.
     */
    where: WatchlistWhereUniqueInput;
  };

  /**
   * Watchlist findUniqueOrThrow
   */
  export type WatchlistFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * Filter, which Watchlist to fetch.
     */
    where: WatchlistWhereUniqueInput;
  };

  /**
   * Watchlist findFirst
   */
  export type WatchlistFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * Filter, which Watchlist to fetch.
     */
    where?: WatchlistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Watchlists to fetch.
     */
    orderBy?:
      | WatchlistOrderByWithRelationInput
      | WatchlistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Watchlists.
     */
    cursor?: WatchlistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Watchlists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Watchlists.
     */
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[];
  };

  /**
   * Watchlist findFirstOrThrow
   */
  export type WatchlistFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * Filter, which Watchlist to fetch.
     */
    where?: WatchlistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Watchlists to fetch.
     */
    orderBy?:
      | WatchlistOrderByWithRelationInput
      | WatchlistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Watchlists.
     */
    cursor?: WatchlistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Watchlists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Watchlists.
     */
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[];
  };

  /**
   * Watchlist findMany
   */
  export type WatchlistFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * Filter, which Watchlists to fetch.
     */
    where?: WatchlistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Watchlists to fetch.
     */
    orderBy?:
      | WatchlistOrderByWithRelationInput
      | WatchlistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Watchlists.
     */
    cursor?: WatchlistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Watchlists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Watchlists.
     */
    skip?: number;
    distinct?: WatchlistScalarFieldEnum | WatchlistScalarFieldEnum[];
  };

  /**
   * Watchlist create
   */
  export type WatchlistCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * The data needed to create a Watchlist.
     */
    data: XOR<WatchlistCreateInput, WatchlistUncheckedCreateInput>;
  };

  /**
   * Watchlist createMany
   */
  export type WatchlistCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Watchlists.
     */
    data: WatchlistCreateManyInput | WatchlistCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Watchlist createManyAndReturn
   */
  export type WatchlistCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * The data used to create many Watchlists.
     */
    data: WatchlistCreateManyInput | WatchlistCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Watchlist update
   */
  export type WatchlistUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * The data needed to update a Watchlist.
     */
    data: XOR<WatchlistUpdateInput, WatchlistUncheckedUpdateInput>;
    /**
     * Choose, which Watchlist to update.
     */
    where: WatchlistWhereUniqueInput;
  };

  /**
   * Watchlist updateMany
   */
  export type WatchlistUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Watchlists.
     */
    data: XOR<
      WatchlistUpdateManyMutationInput,
      WatchlistUncheckedUpdateManyInput
    >;
    /**
     * Filter which Watchlists to update
     */
    where?: WatchlistWhereInput;
    /**
     * Limit how many Watchlists to update.
     */
    limit?: number;
  };

  /**
   * Watchlist updateManyAndReturn
   */
  export type WatchlistUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * The data used to update Watchlists.
     */
    data: XOR<
      WatchlistUpdateManyMutationInput,
      WatchlistUncheckedUpdateManyInput
    >;
    /**
     * Filter which Watchlists to update
     */
    where?: WatchlistWhereInput;
    /**
     * Limit how many Watchlists to update.
     */
    limit?: number;
  };

  /**
   * Watchlist upsert
   */
  export type WatchlistUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * The filter to search for the Watchlist to update in case it exists.
     */
    where: WatchlistWhereUniqueInput;
    /**
     * In case the Watchlist found by the `where` argument doesn't exist, create a new Watchlist with this data.
     */
    create: XOR<WatchlistCreateInput, WatchlistUncheckedCreateInput>;
    /**
     * In case the Watchlist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WatchlistUpdateInput, WatchlistUncheckedUpdateInput>;
  };

  /**
   * Watchlist delete
   */
  export type WatchlistDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
    /**
     * Filter which Watchlist to delete.
     */
    where: WatchlistWhereUniqueInput;
  };

  /**
   * Watchlist deleteMany
   */
  export type WatchlistDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Watchlists to delete
     */
    where?: WatchlistWhereInput;
    /**
     * Limit how many Watchlists to delete.
     */
    limit?: number;
  };

  /**
   * Watchlist without action
   */
  export type WatchlistDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Watchlist
     */
    select?: WatchlistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Watchlist
     */
    omit?: WatchlistOmit<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const PortfolioScalarFieldEnum: {
    id: 'id';
    userId: 'userId';
    stockNo: 'stockNo';
    stockName: 'stockName';
    buyPrice: 'buyPrice';
    buyDate: 'buyDate';
    shares: 'shares';
    memo: 'memo';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type PortfolioScalarFieldEnum =
    (typeof PortfolioScalarFieldEnum)[keyof typeof PortfolioScalarFieldEnum];

  export const WatchlistScalarFieldEnum: {
    id: 'id';
    userId: 'userId';
    stockNo: 'stockNo';
    stockName: 'stockName';
    createdAt: 'createdAt';
  };

  export type WatchlistScalarFieldEnum =
    (typeof WatchlistScalarFieldEnum)[keyof typeof WatchlistScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int'
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int[]'
  >;

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String'
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String[]'
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float'
  >;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float[]'
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime'
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Deep Input Types
   */

  export type PortfolioWhereInput = {
    AND?: PortfolioWhereInput | PortfolioWhereInput[];
    OR?: PortfolioWhereInput[];
    NOT?: PortfolioWhereInput | PortfolioWhereInput[];
    id?: IntFilter<'Portfolio'> | number;
    userId?: StringFilter<'Portfolio'> | string;
    stockNo?: StringFilter<'Portfolio'> | string;
    stockName?: StringFilter<'Portfolio'> | string;
    buyPrice?: FloatFilter<'Portfolio'> | number;
    buyDate?: DateTimeFilter<'Portfolio'> | Date | string;
    shares?: IntFilter<'Portfolio'> | number;
    memo?: StringNullableFilter<'Portfolio'> | string | null;
    createdAt?: DateTimeFilter<'Portfolio'> | Date | string;
    updatedAt?: DateTimeFilter<'Portfolio'> | Date | string;
  };

  export type PortfolioOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    buyPrice?: SortOrder;
    buyDate?: SortOrder;
    shares?: SortOrder;
    memo?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PortfolioWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: PortfolioWhereInput | PortfolioWhereInput[];
      OR?: PortfolioWhereInput[];
      NOT?: PortfolioWhereInput | PortfolioWhereInput[];
      userId?: StringFilter<'Portfolio'> | string;
      stockNo?: StringFilter<'Portfolio'> | string;
      stockName?: StringFilter<'Portfolio'> | string;
      buyPrice?: FloatFilter<'Portfolio'> | number;
      buyDate?: DateTimeFilter<'Portfolio'> | Date | string;
      shares?: IntFilter<'Portfolio'> | number;
      memo?: StringNullableFilter<'Portfolio'> | string | null;
      createdAt?: DateTimeFilter<'Portfolio'> | Date | string;
      updatedAt?: DateTimeFilter<'Portfolio'> | Date | string;
    },
    'id'
  >;

  export type PortfolioOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    buyPrice?: SortOrder;
    buyDate?: SortOrder;
    shares?: SortOrder;
    memo?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: PortfolioCountOrderByAggregateInput;
    _avg?: PortfolioAvgOrderByAggregateInput;
    _max?: PortfolioMaxOrderByAggregateInput;
    _min?: PortfolioMinOrderByAggregateInput;
    _sum?: PortfolioSumOrderByAggregateInput;
  };

  export type PortfolioScalarWhereWithAggregatesInput = {
    AND?:
      | PortfolioScalarWhereWithAggregatesInput
      | PortfolioScalarWhereWithAggregatesInput[];
    OR?: PortfolioScalarWhereWithAggregatesInput[];
    NOT?:
      | PortfolioScalarWhereWithAggregatesInput
      | PortfolioScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'Portfolio'> | number;
    userId?: StringWithAggregatesFilter<'Portfolio'> | string;
    stockNo?: StringWithAggregatesFilter<'Portfolio'> | string;
    stockName?: StringWithAggregatesFilter<'Portfolio'> | string;
    buyPrice?: FloatWithAggregatesFilter<'Portfolio'> | number;
    buyDate?: DateTimeWithAggregatesFilter<'Portfolio'> | Date | string;
    shares?: IntWithAggregatesFilter<'Portfolio'> | number;
    memo?: StringNullableWithAggregatesFilter<'Portfolio'> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<'Portfolio'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Portfolio'> | Date | string;
  };

  export type WatchlistWhereInput = {
    AND?: WatchlistWhereInput | WatchlistWhereInput[];
    OR?: WatchlistWhereInput[];
    NOT?: WatchlistWhereInput | WatchlistWhereInput[];
    id?: IntFilter<'Watchlist'> | number;
    userId?: StringFilter<'Watchlist'> | string;
    stockNo?: StringFilter<'Watchlist'> | string;
    stockName?: StringFilter<'Watchlist'> | string;
    createdAt?: DateTimeFilter<'Watchlist'> | Date | string;
  };

  export type WatchlistOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    createdAt?: SortOrder;
  };

  export type WatchlistWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      userId_stockNo?: WatchlistUserIdStockNoCompoundUniqueInput;
      AND?: WatchlistWhereInput | WatchlistWhereInput[];
      OR?: WatchlistWhereInput[];
      NOT?: WatchlistWhereInput | WatchlistWhereInput[];
      userId?: StringFilter<'Watchlist'> | string;
      stockNo?: StringFilter<'Watchlist'> | string;
      stockName?: StringFilter<'Watchlist'> | string;
      createdAt?: DateTimeFilter<'Watchlist'> | Date | string;
    },
    'id' | 'userId_stockNo'
  >;

  export type WatchlistOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    createdAt?: SortOrder;
    _count?: WatchlistCountOrderByAggregateInput;
    _avg?: WatchlistAvgOrderByAggregateInput;
    _max?: WatchlistMaxOrderByAggregateInput;
    _min?: WatchlistMinOrderByAggregateInput;
    _sum?: WatchlistSumOrderByAggregateInput;
  };

  export type WatchlistScalarWhereWithAggregatesInput = {
    AND?:
      | WatchlistScalarWhereWithAggregatesInput
      | WatchlistScalarWhereWithAggregatesInput[];
    OR?: WatchlistScalarWhereWithAggregatesInput[];
    NOT?:
      | WatchlistScalarWhereWithAggregatesInput
      | WatchlistScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<'Watchlist'> | number;
    userId?: StringWithAggregatesFilter<'Watchlist'> | string;
    stockNo?: StringWithAggregatesFilter<'Watchlist'> | string;
    stockName?: StringWithAggregatesFilter<'Watchlist'> | string;
    createdAt?: DateTimeWithAggregatesFilter<'Watchlist'> | Date | string;
  };

  export type PortfolioCreateInput = {
    userId: string;
    stockNo: string;
    stockName: string;
    buyPrice: number;
    buyDate: Date | string;
    shares: number;
    memo?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PortfolioUncheckedCreateInput = {
    id?: number;
    userId: string;
    stockNo: string;
    stockName: string;
    buyPrice: number;
    buyDate: Date | string;
    shares: number;
    memo?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PortfolioUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    buyPrice?: FloatFieldUpdateOperationsInput | number;
    buyDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    shares?: IntFieldUpdateOperationsInput | number;
    memo?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PortfolioUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    buyPrice?: FloatFieldUpdateOperationsInput | number;
    buyDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    shares?: IntFieldUpdateOperationsInput | number;
    memo?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PortfolioCreateManyInput = {
    id?: number;
    userId: string;
    stockNo: string;
    stockName: string;
    buyPrice: number;
    buyDate: Date | string;
    shares: number;
    memo?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PortfolioUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    buyPrice?: FloatFieldUpdateOperationsInput | number;
    buyDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    shares?: IntFieldUpdateOperationsInput | number;
    memo?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PortfolioUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    buyPrice?: FloatFieldUpdateOperationsInput | number;
    buyDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    shares?: IntFieldUpdateOperationsInput | number;
    memo?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistCreateInput = {
    userId: string;
    stockNo: string;
    stockName: string;
    createdAt?: Date | string;
  };

  export type WatchlistUncheckedCreateInput = {
    id?: number;
    userId: string;
    stockNo: string;
    stockName: string;
    createdAt?: Date | string;
  };

  export type WatchlistUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistCreateManyInput = {
    id?: number;
    userId: string;
    stockNo: string;
    stockName: string;
    createdAt?: Date | string;
  };

  export type WatchlistUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WatchlistUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    userId?: StringFieldUpdateOperationsInput | string;
    stockNo?: StringFieldUpdateOperationsInput | string;
    stockName?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type PortfolioCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    buyPrice?: SortOrder;
    buyDate?: SortOrder;
    shares?: SortOrder;
    memo?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PortfolioAvgOrderByAggregateInput = {
    id?: SortOrder;
    buyPrice?: SortOrder;
    shares?: SortOrder;
  };

  export type PortfolioMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    buyPrice?: SortOrder;
    buyDate?: SortOrder;
    shares?: SortOrder;
    memo?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PortfolioMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    buyPrice?: SortOrder;
    buyDate?: SortOrder;
    shares?: SortOrder;
    memo?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PortfolioSumOrderByAggregateInput = {
    id?: SortOrder;
    buyPrice?: SortOrder;
    shares?: SortOrder;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type WatchlistUserIdStockNoCompoundUniqueInput = {
    userId: string;
    stockNo: string;
  };

  export type WatchlistCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    createdAt?: SortOrder;
  };

  export type WatchlistAvgOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type WatchlistMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    createdAt?: SortOrder;
  };

  export type WatchlistMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    stockNo?: SortOrder;
    stockName?: SortOrder;
    createdAt?: SortOrder;
  };

  export type WatchlistSumOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
