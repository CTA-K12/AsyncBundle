<?php

namespace Mesd\AsyncBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class AsyncController extends Controller
{

    /*
     * indexAction()
     *
     * Determines if the asynchronous functionality is on-line. The method
     * also servers as a good route for creating the base path for async
     * calls in twig templates:
     *
     *    <script>
     *        var MesdAsyncPath = '{{ path('MesdAsyncBundle') }}';
     *    </script>
     */
    public function indexAction()
    {
        return new Response('Async Controller On-line');
    }


    /*
     * addAction()
     *
     * Inserts a new entity with the specified data.
     */
    public function addAction($entityName, $entityData)
    {
        $entityData = explode(';', $entityData);
        $entityManager = $this->getDoctrine()->getManager();
        $entityInfo = $entityManager->getClassMetadata($entityName);
        $entity = new $entityInfo->name;

        // Process each entity field
        foreach ($entityData as $key => $field) {
            list($fieldName, $fieldValue) = explode('+', $field);

            if (strstr($fieldName, ':')) {
                //Entity field is an association, load the associated entity
                $methodName = 'set' . ucwords(explode(':', $fieldName)[1]);
                $entity->$methodName($entityManager->getReference($fieldName, $fieldValue));
            }
            else {
                // Entity field is typical column, just set raw value
                $methodName = 'set' . ucwords($fieldName);
                $entity->$methodName($fieldValue);
            }

        }

        $entityManager->persist($entity);
        $entityManager->flush();

        return new JsonResponse(
            [
                'entityId' => $entity->getId(),
                'message'   => 'Insert Successful'
            ]
        );
    }


    /*
     * customAction()
     *
     * Pass off handling to a custom class. Set managerRequired to true and
     * the entity manager will be passed into your class constructor.
     *
     */
    public function customAction($className, $classMethod, $classData, $managerRequired = false)
    {
        $paramaters = $this->unserializeCustomParameters($classData);
        $className = str_replace('__', '\\', $className);

        if ('true' === $managerRequired) {
            $entityManager = $this->getDoctrine()->getManager();
            $customClass = new $className($entityManager);
        }
        else {
            $customClass = new $className();
        }

        $results = (0 < count($paramaters)) ? $customClass->$classMethod($paramaters) : $customClass->$classMethod();

        return new Response('Custom operation performed');
    }


    /*
     * updateAction()
     *
     * Updates a specific entity column with a new value.
     */
    public function updateAction($entityName, $entityField, $entityId, $newValue)
    {
        $entityManager = $this->getDoctrine()->getManager();
        $entity = $entityManager->getRepository($entityName)->findOneById($entityId);

        $getMethodName = 'get' . ucwords($entityField);
        $setMethodName = 'set' . ucwords($entityField);

        // Only update the value if it has changed
        if ($newValue != $entity->$getMethodName($newValue)) {
            $entity->$setMethodName($newValue);
            $entityManager->persist($entity);
            $entityManager->flush();

            return new Response('Update Successful');
        }

        return new Response('Update was not needed');
    }


    /*
     * searchAction()
     *
     * Searches for matching entities based on a repository method, provided
     * parameters, and search query.
     */
    public function searchAction($entityName, $repoMethod, $repoMethodParams, $searchQuery)
    {
        $parameters = explode(';', $repoMethodParams);
        $entityManager = $this->getDoctrine()->getManager();

        if (isset($repoMethodParams)) {
            $entity = $entityManager->getRepository($entityName)->$repoMethod($parameters, $searchQuery);

        } else {

            $entity = $entityManager->getRepository($entityName)->$repoMethod($searchQuery);
        }

        return new JsonResponse(array('data' => $entity));
    }


    /*
     * unserializeCustomParameters()
     *
     * Converts a serialized string of parameters and their values into a
     * an array.
     *
     */
    private function unserializeCustomParameters($string)
    {
        $paramValuePairs = explode(';', $string);

        $parameters = [];
        // Process each data pair
        foreach ($paramValuePairs as $key => $data) {
            if (strstr($data, '+')) {
                list($fieldName, $fieldValue) = explode('+', $data);
                $parameters[$fieldName] = $fieldValue;
            }
        }

        return $parameters;
    }

}
