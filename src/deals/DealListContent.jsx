import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import {
    useMutation,
    Identifier,
    useListContext,
    RecordMap,
    DataProviderContext,
} from 'react-admin';
import { Box } from '@material-ui/core';
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd';
import isEqual from 'lodash/isEqual';

import { DealColumn } from './DealColumn';
import { stages } from './stages';
import { Deal } from '../types';

interface DealsByColumn {
    [stage: string]: Identifier[];
}

const initialDeals: DealsByColumn = stages.reduce(
    (obj, stage) => ({ ...obj, [stage]: [] }),
    {}
);

const getDealsByColumn = (
    ids: Identifier[],
    data: RecordMap<Deal>
): DealsByColumn => {
    // group deals by column
    const columns = ids.reduce(
        (acc, id) => {
            acc[data[id].stage].push(id);
            return acc;
        },
        stages.reduce((obj, stage) => ({ ...obj, [stage]: [] }), {} as any)
    );
    // order each column by index
    stages.forEach(stage => {
        columns[stage] = columns[stage].sort(
            (a: Identifier, b: Identifier) => data[a].index - data[b].index
        );
    });
    return columns;
};

export const DealListContent = () => {
    const {
        data,
        ids,
        loaded,
        page,
        perPage,
        currentSort,
        filterValues,
    } = useListContext<Deal>();

    const [deals, setDeals] = useState<DealsByColumn>(
        loaded ? getDealsByColumn(ids, data) : initialDeals
    );
    const dataProvider = useContext(DataProviderContext);
  
    const [refresh] = useMutation({
        resource: 'deals',
        type: 'getList',
        payload: {
            pagination: { page, perPage },
            sort: currentSort,
            filter: filterValues,
        },
    });

    useEffect(() => {
        if (!loaded) return;
        const newDeals = getDealsByColumn(ids, data);
        if (isEqual(deals, newDeals)) {
            return;
        }
        setDeals(newDeals);
    }, [data, ids, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!loaded) return null;

    const onDragEnd: OnDragEndResponder = async result => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            // moving deal inside the same column

            const column = Array.from(deals[source.droppableId]); 
            const sourceDeal = data[column[source.index]];
            const destinationDeal = data[column[destination.index]];

           
            column.splice(source.index, 1);
           
            column.splice(destination.index, 0, Number(draggableId));
            setDeals({
                ...deals,
                [source.droppableId]: column,
            });

            const { data: columnDeals } = await dataProvider.getList('deals', {
                sort: { field: 'index', order: 'ASC' },
                pagination: { page: 1, perPage: 100 },
                filter: { stage: source.droppableId },
            });

            if (source.index > destination.index) {
                // deal moved up, eg
                // dest   src
                //  <------
                // [4, 7, 23, 5]

                await Promise.all([
      
                    ...columnDeals
                        .filter(
                            deal =>
                                deal.index >= destinationDeal.index &&
                                deal.index < sourceDeal.index
                        )
                        .map(deal =>
                            dataProvider.update('deals', {
                                id: deal.id,
                                data: { index: deal.index + 1 },
                                previousData: deal,
                            })
                        ),
                    // for the deal that was moved, update its index
                    dataProvider.update('deals', {
                        id: sourceDeal.id,
                        data: { index: destinationDeal.index },
                        previousData: sourceDeal,
                    }),
                ]);

                refresh();
            } else {
                // deal moved down, e.g
                // src   dest
                //  ------>
                // [4, 7, 23, 5]

                await Promise.all([
                    
                    ...columnDeals
                        .filter(
                            deal =>
                                deal.index <= destinationDeal.index &&
                                deal.index > sourceDeal.index
                        )
                        .map(deal =>
                            dataProvider.update('deals', {
                                id: deal.id,
                                data: { index: deal.index - 1 },
                                previousData: deal,
                            })
                        ),
                    // for the deal that was moved, update its index
                    dataProvider.update('deals', {
                        id: sourceDeal.id,
                        data: { index: destinationDeal.index },
                        previousData: sourceDeal,
                    }),
                ]);

                refresh();
            }
        } else {

            const sourceColumn = Array.from(deals[source.droppableId]);
            const destinationColumn = Array.from(
                deals[destination.droppableId]
            ); 
            const sourceDeal = data[sourceColumn[source.index]];
            const destinationDeal = data[destinationColumn[destination.index]];

           
            sourceColumn.splice(source.index, 1);
            destinationColumn.splice(destination.index, 0, draggableId);
            setDeals({
                ...deals,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destinationColumn,
            });

            
            const [
                { data: sourceDeals },
                { data: destinationDeals },
            ] = await Promise.all([
                dataProvider.getList('deals', {
                    sort: { field: 'index', order: 'ASC' },
                    pagination: { page: 1, perPage: 100 },
                    filter: { stage: source.droppableId },
                }),
                dataProvider.getList('deals', {
                    sort: { field: 'index', order: 'ASC' },
                    pagination: { page: 1, perPage: 100 },
                    filter: { stage: destination.droppableId },
                }),
            ]);

            await Promise.all([
                
                ...sourceDeals
                    .filter(deal => deal.index > sourceDeal.index)
                    .map(deal =>
                        dataProvider.update('deals', {
                            id: deal.id,
                            data: { index: deal.index - 1 },
                            previousData: deal,
                        })
                    ),
                
                ...destinationDeals
                    .filter(deal =>
                        destinationDeal
                            ? deal.index >= destinationDeal.index
                            : false
                    )
                    .map(deal =>
                        dataProvider.update('deals', {
                            id: deal.id,
                            data: { index: deal.index + 1 },
                            previousData: deal,
                        })
                    ),
              
                dataProvider.update('deals', {
                    id: sourceDeal.id,
                    data: {
                        index: destinationDeal
                            ? destinationDeal.index
                            : destinationDeals.pop()!.index + 1,
                        stage: destination.droppableId,
                    },
                    previousData: sourceDeal,
                }),
            ]);

            refresh();
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box display="flex">
                {stages.map(stage => (
                    <DealColumn
                        stage={stage}
                        dealIds={deals[stage]}
                        data={data}
                        key={stage}
                    />
                ))}
            </Box>
        </DragDropContext>
    );
};
