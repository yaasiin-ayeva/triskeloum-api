export type JoinTableOption = {
    /** The name of the main table to join, e.g. `users` */
    mainTable: string;
    /** The name of the referenced table, e.g. `posts` */
    referencedTable: string;
    /** The name of the column in the main table that is referenced, e.g. `users.post_id` */
    joinField: string;

    /** Shows if the join should be a single left join or a left join and select */
    implicit?: boolean;
};
