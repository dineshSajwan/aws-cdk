import { Construct } from 'constructs';
import * as iam from '../../../aws-iam';
import * as sfn from '../../../aws-stepfunctions';
import { Stack } from '../../../core';
import { integrationResourceArn } from '../private/task-utils';

interface EmrModifyInstanceFleetByNameOptions {
  /**
   * The ClusterId to update.
   */
  readonly clusterId: string;

  /**
   * The InstanceFleetName to update.
   */
  readonly instanceFleetName: string;

  /**
   * The target capacity of On-Demand units for the instance fleet.
   *
   * @see https://docs.aws.amazon.com/emr/latest/APIReference/API_InstanceFleetModifyConfig.html
   *
   * @default - None
   */
  readonly targetOnDemandCapacity: number;

  /**
   * The target capacity of Spot units for the instance fleet.
   *
   * @see https://docs.aws.amazon.com/emr/latest/APIReference/API_InstanceFleetModifyConfig.html
   *
   * @default - None
   */
  readonly targetSpotCapacity: number;
}

/**
 * Properties for EmrModifyInstanceFleetByName using JSONPath
 */
export interface EmrModifyInstanceFleetByNameJsonPathProps extends sfn.TaskStateJsonPathBaseProps, EmrModifyInstanceFleetByNameOptions { }

/**
 * Properties for EmrModifyInstanceFleetByName using JSONata
 */
export interface EmrModifyInstanceFleetByNameJsonataProps extends sfn.TaskStateJsonataBaseProps, EmrModifyInstanceFleetByNameOptions { }

/**
 * Properties for EmrModifyInstanceFleetByName
 */
export interface EmrModifyInstanceFleetByNameProps extends sfn.TaskStateBaseProps, EmrModifyInstanceFleetByNameOptions { }

/**
 * A Step Functions Task to to modify an InstanceFleet on an EMR Cluster.
 */
export class EmrModifyInstanceFleetByName extends sfn.TaskStateBase {
  /**
   * A Step Functions Task using JSONPath to to modify an InstanceFleet on an EMR Cluster.
   */
  public static jsonPath(scope: Construct, id: string, props: EmrModifyInstanceFleetByNameJsonPathProps) {
    return new EmrModifyInstanceFleetByName(scope, id, props);
  }
  /**
   * A Step Functions Task using JSONata to to modify an InstanceFleet on an EMR Cluster.
   */
  public static jsonata(scope: Construct, id: string, props: EmrModifyInstanceFleetByNameJsonataProps) {
    return new EmrModifyInstanceFleetByName(scope, id, {
      ...props,
      queryLanguage: sfn.QueryLanguage.JSONATA,
    });
  }

  protected readonly taskPolicies?: iam.PolicyStatement[];
  protected readonly taskMetrics?: sfn.TaskMetricsConfig;

  constructor(scope: Construct, id: string, private readonly props: EmrModifyInstanceFleetByNameProps) {
    super(scope, id, props);

    this.taskPolicies = [
      new iam.PolicyStatement({
        actions: [
          'elasticmapreduce:ModifyInstanceFleet',
          'elasticmapreduce:ListInstanceFleets',
        ],
        resources: [
          Stack.of(this).formatArn({
            service: 'elasticmapreduce',
            resource: 'cluster',
            resourceName: '*',
          }),
        ],
      }),
    ];
  }

  /**
   * @internal
   */
  protected _renderTask(topLevelQueryLanguage?: sfn.QueryLanguage): any {
    const queryLanguage = sfn._getActualQueryLanguage(topLevelQueryLanguage, this.props.queryLanguage);
    return {
      Resource: integrationResourceArn('elasticmapreduce', 'modifyInstanceFleetByName',
        sfn.IntegrationPattern.REQUEST_RESPONSE),
      ...this._renderParametersOrArguments({
        ClusterId: this.props.clusterId,
        InstanceFleetName: this.props.instanceFleetName,
        InstanceFleet: {
          TargetOnDemandCapacity: this.props.targetOnDemandCapacity,
          TargetSpotCapacity: this.props.targetSpotCapacity,
        },
      }, queryLanguage),
    };
  }
}
